const fs = require('fs');
const url = require('url');
const querystring = require('querystring');
const path = require('path');
const { JSDOM } = require('jsdom');
const Jimp = require('jimp');

const supportedExtensions = ['jpg', 'jpeg', 'gif', 'png', 'bmp', 'tiff'];

const transformImgPath = (src) => {
  if (src.startsWith('/') && !src.startsWith('//')) {
    return `.${src}`;
  }

  return src;
};

const defaultLazyImagesConfig = {
  maxPlaceholderWidth: 12,
  maxPlaceholderHeight: 12,
  placeholderQuality: 60,
  imgSelector: 'img',
  transformImgPath,
  className: ['lazyload'],
  cacheFile: '.lazyimages.json',
  appendInitScript: true,
  scriptSrc: 'https://cdn.jsdelivr.net/npm/lazysizes@5/lazysizes.min.js',
  preferNativeLazyLoad: true,
};

let lazyImagesConfig = defaultLazyImagesConfig;
let lazyImagesCache = {};

const logMessage = (message) => {
  console.log(`LazyImages - ${message}`);
};

const loadCache = () => {
  const { cacheFile } = lazyImagesConfig;

  if (!cacheFile) {
    return;
  }

  try {
    if (fs.existsSync(cacheFile)) {
      const cachedData = fs.readFileSync(cacheFile, 'utf8');
      lazyImagesCache = JSON.parse(cachedData);
    }
  } catch (e) {
    console.error('LazyImages: cacheFile', e);
  }
};

const readCache = (imageSrc) => {
  if (imageSrc in lazyImagesCache) {
    return lazyImagesCache[imageSrc];
  }

  return undefined;
};

const updateCache = (imageSrc, imageData) => {
  const { cacheFile } = lazyImagesConfig;
  lazyImagesCache[imageSrc] = imageData;

  if (cacheFile) {
    const cacheData = JSON.stringify(lazyImagesCache);

    fs.writeFile(cacheFile, cacheData, (err) => {
      if (err) {
        console.error('LazyImages: cacheFile', e);
      }
    });
  }
};

const getImageData = async (imageSrc) => {
  const {
    maxPlaceholderWidth,
    maxPlaceholderHeight,
    placeholderQuality,
  } = lazyImagesConfig;

  let imageData = readCache(imageSrc);

  if (imageData) {
    return imageData;
  }

  logMessage(`started processing ${imageSrc}`);

  const image = await Jimp.read(imageSrc);
  const width = image.bitmap.width;
  const height = image.bitmap.height;

  const resized = image
    .scaleToFit(maxPlaceholderWidth, maxPlaceholderHeight)
    .quality(placeholderQuality);

  const encoded = await resized.getBase64Async(Jimp.AUTO);

  imageData = {
    width,
    height,
    src: encoded,
  };

  logMessage(`finished processing ${imageSrc}`);
  updateCache(imageSrc, imageData);
  return imageData;
};

const processImage = async (imgElem) => {
  const { transformImgPath, className } = lazyImagesConfig;

  if (/^data:/.test(imgElem.src)) {
    logMessage(`skipping "data:" src`);
    return;
  }

  const imgPath = transformImgPath(imgElem.src);
  const parsedUrl = url.parse(imgPath);
  let fileExt = path.extname(parsedUrl.pathname).substr(1);

  if (!fileExt) {
    // Twitter and similar pass the file format in the querystring, e.g. "?format=jpg"
    fileExt = querystring.parse(parsedUrl.query).format;
  }

  imgElem.setAttribute('loading', 'lazy');
  imgElem.setAttribute('data-src', imgElem.src);

  const classNameArr = Array.isArray(className) ? className : [className];
  imgElem.classList.add(...classNameArr);

  if (imgElem.hasAttribute('srcset')) {
    const srcSet = imgElem.getAttribute('srcset');
    imgElem.setAttribute('data-srcset', srcSet);
    imgElem.removeAttribute('srcset');
  }

  if (!supportedExtensions.includes(fileExt.toLowerCase())) {
    logMessage(`${fileExt} placeholder not supported: ${imgPath}`);
    return;
  }

  try {
    const image = await getImageData(imgPath);

    imgElem.setAttribute('width', image.width);
    imgElem.setAttribute('height', image.height);
    imgElem.setAttribute('src', image.src);
  } catch (e) {
    console.error('LazyImages', imgPath, e);
  }
};

// Have to use lowest common denominator JS language features here
// because we don't know what the target browser support is
const initLazyImages = function (selector, src, preferNativeLazyLoad) {
  if (preferNativeLazyLoad && 'loading' in HTMLImageElement.prototype) {
    var images = document.querySelectorAll(selector);
    var numImages = images.length;

    if (numImages > 0) {
      for (var i = 0; i < numImages; i++) {
        if ('dataset' in images[i] && 'src' in images[i].dataset) {
          images[i].src = images[i].dataset.src;
        }

        if ('srcset' in images[i].dataset) {
          images[i].srcset = images[i].dataset.srcset;
        }
      }
    }

    return;
  }

  var script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.body.appendChild(script);
};

const transformMarkup = async (rawContent, outputPath) => {
  const {
    imgSelector,
    appendInitScript,
    scriptSrc,
    preferNativeLazyLoad,
  } = lazyImagesConfig;
  let content = rawContent;

  if (outputPath && outputPath.endsWith('.html')) {
    const dom = new JSDOM(content);
    const images = [...dom.window.document.querySelectorAll(imgSelector)];

    if (images.length > 0) {
      logMessage(`found ${images.length} images in ${outputPath}`);
      await Promise.all(images.map(processImage));
      logMessage(`processed ${images.length} images in ${outputPath}`);

      if (appendInitScript) {
        dom.window.document.body.insertAdjacentHTML(
          'beforeend',
          `<script>
            (${initLazyImages.toString()})(
              '${imgSelector}',
              '${scriptSrc}',
              ${!!preferNativeLazyLoad}
            );
          </script>`
        );
      }

      content = dom.serialize();
    }
  }

  return content;
};

module.exports = {
  initArguments: {},
  configFunction: (eleventyConfig, pluginOptions = {}) => {
    lazyImagesConfig = Object.assign(
      {},
      defaultLazyImagesConfig,
      pluginOptions
    );

    loadCache();
    eleventyConfig.addTransform('lazyimages', transformMarkup);
  },
};
