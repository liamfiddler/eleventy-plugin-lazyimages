# LazyImages plugin for [11ty](https://www.11ty.io/)

![Banner image](https://repository-images.githubusercontent.com/190408612/4305b000-94d2-11e9-922c-72a93cafadcf)

What this plugin does:
- 🔍 Finds IMG elements in your markup
- 💉 Injects the source image width and height attributes to the element
- 🔜 Defers loading of the image until it is in/near the viewport
  (native lazy loading only, no polyfill)

This plugin supports:
- Any 11ty template format that outputs to a .html file
- Absolute and relative image paths
- Custom image selectors; target all images or only images in a certain part
  of the page
- Responsive images using `srcset`; the image in the `src` attribute will be
  used for determining the placeholder image and width/height attributes

----

**Like this project? [Buy the original author a coffee!](https://ko-fi.com/liamfiddler)**

----

## Getting started

### Install the plugin

In your project directory run:
```sh
# Using npm
npm install github:hirusi/eleventy-plugin-lazyimages --save-dev

# Or using yarn
yarn add github:hirusi/eleventy-plugin-lazyimages --dev
```

Then update your project's `.eleventy.js` to include the plugin:
```js
const lazyImagesPlugin = require('eleventy-plugin-lazyimages');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(lazyImagesPlugin);
};
```

### Tweak your CSS (optional)

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
The above CSS will ensure the image is never wider than its
container and the aspect ratio is maintained.

### Configure the plugin (optional)

You can pass an object with configuration options as the second
parameter:
```js
eleventyConfig.addPlugin(lazyImagesPlugin, {
  imgSelector: '.post-content img', // custom image selector
  cacheFile: '', // don't cache results to a file
});
```
A full list of available configuration options are listed below,
and some common questions are covered at the end of this file.

## Configuration options

| Key | Type | Description |
|--|--|--|
| `imgSelector` | String | The DOM selector used to find IMG elements in the markup.<br>Default: `img` |
| `transformImgPath` | Function | A function that takes the IMG `src` attribute and returns a string representing the actual path to your image. |
| `cacheFile` | String | Cache image metadata and placeholder images to this filename. Greatly speeds up subsequent builds. Pass an empty string to turn off the cache.<br>Default: `.lazyimages.json` |

## Built with

* [JSDOM](https://github.com/jsdom/jsdom) - To find and modify image
  elements in 11ty's generated markup
* [JIMP](https://github.com/oliver-moran/jimp) - To read image
  metadata and generate low-res placeholders
* [LazySizes](https://github.com/aFarkas/lazysizes) - Handles lazy loading

## Contributing

This project welcomes suggestions and Pull Requests!

## Authors

* **Liam Fiddler** - *Initial work* - [@liamfiddler](https://github.com/liamfiddler)
* **[Ru Singh](https://rusingh.com)** - *stripped down to native lazy loading and removes LQIP*

See also the list of
[contributors](https://github.com/hirusi/eleventy-plugin-lazyimages/contributors)
who participated in this project.

## License

This project is licensed under the MIT License -
see the [LICENSE](LICENSE) file for details

## Acknowledgments

* The wonderfully supportive team at
  [Mentally Friendly](https://mentallyfriendly.com)
* Everyone who has contributed to the
  [11ty](https://www.11ty.io/) project, without whom
  this plugin wouldn't run
* [José M. Pérez's blog post about progressive image loading](https://jmperezperez.com/medium-image-progressive-loading-placeholder/)
  which served as the inspiration for this plugin
* [Addy Osmani's blog post about lazy loading](https://addyosmani.com/blog/lazy-loading/)
  which served as the inspiration for the init script

## Common questions

### Does my local image path have to match the output path?

**(a.k.a Why do I have "Error: ENOENT" messages in my terminal?)**

**(a.k.a Can I nest all my input files under `/src`?)**

By default this plugin assumes your file paths match the output paths,
i.e. `<img src="/images/dog.jpg" />` exists at `<project root>/images/dog.jpg`.

However the `transformImgPath` config option allows you to specify a function
that points the plugin to the internal image path.

For example, if your file structure stores `<img src="/images/dog.jpg" />`
at `<project root>/src/images/dog.jpg` you could set `transformImgPath` like:
```js
// .eleventy.js
eleventyConfig.addPlugin(lazyImagesPlugin, {
  transformImgPath: (imgPath) => {
    if (imgPath.startsWith('/') && !imgPath.startsWith('//')) {
      return `./src${imgPath}`;
    }

    return imgPath;
  },
});
```

### Can I use this plugin with a plugin that moves/renames image files?

Yes! The key to solving this problem is the order in which the plugins are
defined in `.eleventy.js`. It is important this plugin runs after the plugin
that moves/renames files otherwise this plugin may still be referencing the
original filepath in the markup, not the one generated by the other plugin.

We've included an
[example project in this repo](./example/eleventy-plugin-local-images)
demonstrating this plugin with
[eleventy-plugin-local-images](https://github.com/robb0wen/eleventy-plugin-local-images).

----

**Like this project? [Buy the original author a coffee!](https://ko-fi.com/liamfiddler)**

----
