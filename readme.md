# Lazy image loader plugin for 11ty

>An 11ty plugin that scans for images in your markup, adds the correct width and height attributes to the tag, defers loading of the image until it is in the viewport (lazy loading), and generates + displays a blurry low-res placeholder until the image loads.

## Getting started

### Install the plugin

In your project directory run:
```sh
npm install liamfiddler/eleventy-plugin-lazyimages --save-dev
```

Then update your project's `.eleventy.js` to include the plugin:
```js
const lazyImagesPlugin = require('eleventy-plugin-lazyimages');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(lazyImagesPlugin);
  // ...
};
```

### Tweak your CSS

This plugin will automatically set the width and height attributes
for each image based on the source image dimensions. You might want
to overwrite this with the following CSS:
```css
img {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
}
```
