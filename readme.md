# Lazy image loader plugin for 11ty

A plugin for [11ty](https://www.11ty.io/) that:
1. Scans for IMG elements in your markup
2. Adds the source image width and height attributes to the element
3. Defers loading of the image until it is in/near the viewport (lazy loading)
4. Generates + displays a blurry low-res placeholder until the image has loaded

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
The above CSS will ensure the image is never wider than its container and the aspect ratio is maintained.

### Configure the plugin (optional)

You can pass an object with configuration options as the second parameter:
```js
eleventyConfig.addPlugin(lazyImagesPlugin, {
  // Your config goes here
});
```
A full list of available configuration options are listed below.

## Configuration options

| Key | Type | Description |
|--|--|--|
| `maxPlaceholderWidth` | Integer | The maximum width in pixels of the generated placeholder image. Recommended values are between 6 and 15.<br>Default: `12` |
| `maxPlaceholderHeight` | Integer | The maximum height in pixels of the generated placeholder image. Recommended values are between 6 and 15.<br>Default: `12` |
| `placeholderQuality` | Integer | The JPEG compression quality of the generated placeholder image.<br>Default: `60` |
| `imgQuery` | String | The DOM selector used to find IMG elements in the markup.<br>Default: `img[src^="/"]` |
| `transformImgPath` | Function | A function that takes the IMG `src` attribute and returns a string representing the local path to your image.<br>Default: ``` src => `.${src}` ``` |
| `className` | String | The class name added to found IMG elements. Do not change this value unless you intend to use your own `scriptSrc` configuration.<br>Default: `lazyload` |
| `cache` | Boolean | Store the results of expensive image reads in memory. Uses more memory, but greatly speeds up processing of images that appear in the markup multiple times or when using `eleventy --serve` / `eleventy --watch`.<br>Default: `true` |
| `appendInitScript` | Boolean | Appends code to initialise lazy loading of images to the generated markup. Set this to `false` if you include your own lazy load script.<br>Default: `true` |
| `scriptSrc` | String | The URI for the lazy load script that is injected into the markup via `appendInitScript`.<br>Default: `https://cdn.jsdelivr.net/npm/lazysizes@5/lazysizes.min.js` |

## Built with

* [JSDOM](https://github.com/jsdom/jsdom) - To find and modify image elements in 11ty's generated markup
* [JIMP](https://github.com/oliver-moran/jimp) - To read image metadata and generate low-res placeholders
* [LazySizes](https://github.com/aFarkas/lazysizes) - Handles lazy loading

## Contributing

This project welcomes suggestions and Pull Requests!

## Authors

* **Liam Fiddler** - *Initial work* - [@liamfiddler](https://github.com/liamfiddler)

See also the list of [contributors](https://github.com/liamfiddler/eleventy-plugin-lazyimages/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

* The wonderfully supportive team at [Mentally Friendly](https://mentallyfriendly.com)
* Everyone who has contributed to the [11ty](https://www.11ty.io/) project, without whom this plugin wouldn't run
* [Addy Osmani's blog post about lazy loading](https://addyosmani.com/blog/lazy-loading/) which served as the inspiration for the init script
