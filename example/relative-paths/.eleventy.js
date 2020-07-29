const lazyImagesPlugin = require('eleventy-plugin-lazyimages');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy('img');
  eleventyConfig.addPassthroughCopy('nested2');
  eleventyConfig.addPlugin(lazyImagesPlugin);

  return {
    dir: {
      output: "_site"
    }
  };
};
