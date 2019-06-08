const { JSDOM } = require('jsdom');
const Jimp = require('jimp');

const lazyImagesCache = new Map();

const lazyImagesConfig = {
  maxPlaceholderWidth: 12,
  maxPlaceholderHeight: 12,
  placeholderQuality: 60,
  lazyLoadSrc: 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/4.1.8/lazysizes.min.js',
  imgQuery: 'img[src^="/"]',
};

const getImageData = async imageSrc => {
  if (lazyImagesCache.has(imageSrc)) {
    return lazyImagesCache.get(imageSrc);
  }

  console.log('LazyImages Plugin - Processing', imageSrc);

  const image = await Jimp.read(imageSrc);
  const width = image.bitmap.width;
  const height = image.bitmap.height;

  const resized = image
    .scaleToFit(lazyImagesConfig.maxPlaceholderWidth, lazyImagesConfig.maxPlaceholderHeight)
    .quality(lazyImagesConfig.placeholderQuality);

  const encoded = await resized.getBase64Async(Jimp.MIME_JPEG);

  const imageData = {
    width,
    height,
    src: encoded,
  };

  lazyImagesCache.set(imageSrc, imageData);

  return imageData;
};

// Have to use lowest common denominator JS language features here
// because we don't know what the target browser support is
const initLazyImages = function() {
  if ('loading' in HTMLImageElement.prototype) {
    var images = document.querySelectorAll('img.lazyload');
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
  script.src = lazyImagesConfig.lazyLoadSrc;
  document.body.appendChild(script); // FIXME: how to use query selector here?
};

module.exports = eleventyConfig => {
  eleventyConfig.addTransform('lazyimages', async (rawContent, outputPath) => {
    let content = rawContent;

    if (outputPath.endsWith('.html')) {
      const dom = new JSDOM(content);
      const images = dom.window.document.querySelectorAll(lazyImagesConfig.imgQuery);

      if (images.length) {
        for (let i = 0, numImages = images.length; i < numImages; i++) {
          const src = `.${images[i].src}`; // FIXME: this path is too specific

          images[i].setAttribute('loading', 'lazy');
          images[i].setAttribute('data-src', images[i].src);
          images[i].classList.add('lazyload');

          try {
            const image = await getImageData(src);

            images[i].setAttribute('width', image.width);
            images[i].setAttribute('height', image.height);
            images[i].setAttribute('src', image.src);
          } catch (e) {
            console.error('Error', src, e);
          }
        }

        dom.window.document.body.insertAdjacentHTML(
          'beforeend',
          `<script>(${initLazyImages.toString()})();</script>`
        );

        content = dom.serialize();
      }
    }

    return content;
  });
};
