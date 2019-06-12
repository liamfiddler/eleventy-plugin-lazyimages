const { JSDOM } = require('jsdom');
const Jimp = require('jimp');

const defaultLazyImagesConfig = {
  maxPlaceholderWidth: 12,
  maxPlaceholderHeight: 12,
  placeholderQuality: 60,
  imgQuery: 'img[src^="/"]',
  transformImgPath: src => `.${src}`,
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

  console.log('LazyImages Plugin - Processing', imageSrc);

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

module.exports = {
  initArguments: {},
  configFunction: (eleventyConfig, pluginOptions = {}) => {
    lazyImagesConfig = Object.assign(
      {},
      defaultLazyImagesConfig,
      pluginOptions
    );

    const {
      imgQuery,
      transformImgPath,
      className,
      appendInitScript,
      scriptSrc,
    } = lazyImagesConfig;

    eleventyConfig.addTransform(
      'lazyimages',
      async (rawContent, outputPath) => {
        let content = rawContent;

        if (outputPath.endsWith('.html')) {
          const dom = new JSDOM(content);
          const images = dom.window.document.querySelectorAll(imgQuery);
          const numImages = images.length;

          if (numImages > 0) {
            for (let i = 0; i < numImages; i++) {
              const src = transformImgPath(images[i].src);

              images[i].setAttribute('loading', 'lazy');
              images[i].setAttribute('data-src', images[i].src);
              images[i].classList.add(className);

              try {
                const image = await getImageData(src);

                images[i].setAttribute('width', image.width);
                images[i].setAttribute('height', image.height);
                images[i].setAttribute('src', image.src);
              } catch (e) {
                console.error('LazyImages Plugin - Error', src, e);
              }
            }

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
      }
    );
  },
};
