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
  imgSelector: 'img',
  transformImgPath,
  cacheFile: '.lazyimages.json',
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
  let imageData = readCache(imageSrc);

  if (imageData) {
    return imageData;
  }

  logMessage(`started processing ${imageSrc}`);

  const image = await Jimp.read(imageSrc);

  imageData = {
    width: image.bitmap.width,
    height: image.bitmap.height,
  };

  logMessage(`finished processing ${imageSrc}`);
  updateCache(imageSrc, imageData);
  return imageData;
};

const processImage = async (imgElem) => {
  const { transformImgPath } = lazyImagesConfig;

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

  if (!imgElem.getAttribute('loading')) imgElem.setAttribute('loading', 'lazy');

  if (!supportedExtensions.includes(fileExt.toLowerCase())) {
    logMessage(`${fileExt} placeholder not supported: ${imgPath}`);
    return;
  }

  // External links only lazily loaded. Can't process other attributes like width and height. Use external images sparingly on your site as it might cause jankiness.
  if (imgPath.match(/^http[s]?:\/\//i)) return;

  try {
    const image = await getImageData(imgPath);

    imgElem.setAttribute('width', image.width);
    imgElem.setAttribute('height', image.height);
  } catch (e) {
    console.error('LazyImages', imgPath, e);
  }
};

const transformMarkup = async (rawContent, outputPath) => {
  const { imgSelector } = lazyImagesConfig;
  let content = rawContent;

  if (outputPath && outputPath.endsWith('.html')) {
    const dom = new JSDOM(content);
    const images = [...dom.window.document.querySelectorAll(imgSelector)];

    if (images.length > 0) {
      logMessage(`found ${images.length} images in ${outputPath}`);
      await Promise.all(images.map(processImage));
      logMessage(`processed ${images.length} images in ${outputPath}`);

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
