const lazyImagesPlugin = require('eleventy-plugin-lazyimages');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy('img');
  eleventyConfig.addPlugin(lazyImagesPlugin);
};
