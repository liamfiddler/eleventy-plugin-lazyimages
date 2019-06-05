const { JSDOM } = require('jsdom');
const Jimp = require('jimp');

const getImageData = async imageSrc => {
  const image = await Jimp.read(imageSrc);
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const resized = image.scaleToFit(12, 12).quality(60); // FIXME: configurable size?
  const encoded = await resized.getBase64Async(Jimp.MIME_JPEG);

  return {
    width,
    height,
    src: encoded,
  };
};

const initLazyImages = function() {
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img.lazyload').forEach(function(img) {
      img.src = img.dataset.src;
    });

    return;
  }

  var script = document.createElement('script');
  script.async = true;
  script.src =
    'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/4.1.8/lazysizes.min.js'; // FIXME: version?
  document.body.appendChild(script);
};

module.exports = eleventyConfig => {
  eleventyConfig.addTransform('lazyimages', async (rawContent, outputPath) => {
    let content = rawContent;

    if (outputPath.endsWith('.html')) {
      const dom = new JSDOM(content);
      const images = dom.window.document.querySelectorAll('img'); // FIXME: probably don't want to grab ALL images

      if (images.length) {
        for (let i = 0, numImages = images.length; i < numImages; i++) {
          const src = `.${images[i].src}`; // FIXME: this path is too specific

          console.log('Processing', src);

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
