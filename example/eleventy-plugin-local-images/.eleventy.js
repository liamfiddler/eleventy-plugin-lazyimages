const localImages = require('eleventy-plugin-local-images');
const lazyImagesPlugin = require('eleventy-plugin-lazyimages');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(lazyImagesPlugin); // eleventy-plugin-lazyimages must run before eleventy-plugin-local-images

  eleventyConfig.addPlugin(localImages, {
    distPath: '_site',
    assetPath: '/assets/img',
    selector: 'img',
    attribute: 'data-src', // eleventy-plugin-lazyimages moves the path from `src` to `data-src`
    verbose: false,
  });
};
