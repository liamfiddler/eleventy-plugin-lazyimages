const { JSDOM } = require('jsdom');
const Jimp = require('jimp');

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
  imgQuery: 'img',
  transformImgPath,
  className: 'lazyload',
  cache: true,
  appendInitScript: true,
  scriptSrc: 'https://cdn.jsdelivr.net/npm/lazysizes@5/lazysizes.min.js',
};

let lazyImagesConfig = defaultLazyImagesConfig;
const lazyImagesCache = new Map();

const getImageData = async imageSrc => {
  const {
    maxPlaceholderWidth,
    maxPlaceholderHeight,
    placeholderQuality,
    cache,
  } = lazyImagesConfig;

  if (cache && lazyImagesCache.has(imageSrc)) {
    return lazyImagesCache.get(imageSrc);
  }

  const image = await Jimp.read(imageSrc);
  const width = image.bitmap.width;
  const height = image.bitmap.height;

  const resized = image
    .scaleToFit(maxPlaceholderWidth, maxPlaceholderHeight)
    .quality(placeholderQuality);

  const encoded = await resized.getBase64Async(Jimp.MIME_JPEG);

  const imageData = {
    width,
    height,
    src: encoded,
  };

  if (cache) {
    lazyImagesCache.set(imageSrc, imageData);
  }

  return imageData;
};

const processImage = async imgElem => {
  const { transformImgPath, className } = lazyImagesConfig;
  const imgPath = transformImgPath(imgElem.src);

  imgElem.setAttribute('loading', 'lazy');
  imgElem.setAttribute('data-src', imgElem.src);
  imgElem.classList.add(className);

  if (imgElem.hasAttribute('srcset')) {
    const srcSet = imgElem.getAttribute('srcset');
    imgElem.setAttribute('data-srcset', srcSet);
    imgElem.removeAttribute('srcset');
  }

  try {
    const image = await getImageData(imgPath);

    imgElem.setAttribute('width', image.width);
    imgElem.setAttribute('height', image.height);
    imgElem.setAttribute('src', image.src);
  } catch (e) {
    console.error('LazyImages plugin', imgPath, e);
  }
};

// Have to use lowest common denominator JS language features here
// because we don't know what the target browser support is
const initLazyImages = function(selector, src) {
  if ('loading' in HTMLImageElement.prototype) {
    var images = document.querySelectorAll(selector);
    var numImages = images.length;

    if (numImages > 0) {
      for (var i = 0; i < numImages; i++) {
        images[i].src = images[i].dataset.src;
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
  const { imgQuery, className, appendInitScript, scriptSrc } = lazyImagesConfig;
  let content = rawContent;

  if (outputPath.endsWith('.html')) {
    const dom = new JSDOM(content);
    const images = [...dom.window.document.querySelectorAll(imgQuery)];

    if (images.length > 0) {
      await Promise.all(images.map(processImage));

      if (appendInitScript) {
        dom.window.document.body.insertAdjacentHTML(
          'beforeend',
          `<script>
            (${initLazyImages.toString()})(
              'img.${className}',
              '${scriptSrc}',
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

    eleventyConfig.addTransform('lazyimages', transformMarkup);
  },
};
