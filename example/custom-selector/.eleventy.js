const lazyImagesPlugin = require('eleventy-plugin-lazyimages');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(lazyImagesPlugin, {
    imgSelector: '.lazyimages img',
  });
};
