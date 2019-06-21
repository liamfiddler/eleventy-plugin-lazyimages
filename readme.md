# LazyImages plugin for [11ty](https://www.11ty.io/)

![Banner image](https://repository-images.githubusercontent.com/190408612/4305b000-94d2-11e9-922c-72a93cafadcf)

🔍 Finds IMG elements in your markup

💉 Injects the source image width and height attributes to the element

🔜 Defers loading of the image until it is in/near the viewport (lazy loading)

🖼️ Displays a blurry low-res placeholder until the image has loaded

----

This plugin supports:
- Any 11ty template format that outputs to a .html file
- Absolute and relative image paths
- Custom image selectors; target all images or only images in a certain part
  of the page
- Placeholder generation for all image formats supported by
  [JIMP](https://github.com/oliver-moran/jimp); BMP, GIF, JPEG, PNG, & TIFF
- Responsive images using `srcset`; the image in the `src` attribute will be
  used for determining the placeholder image and width/height attributes

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
A full list of available configuration options are listed below.

## Configuration options

| Key | Type | Description |
|--|--|--|
| `maxPlaceholderWidth` | Integer | The maximum width in pixels of the generated placeholder image. Recommended values are between 6 and 15.<br>Default: `12` |
| `maxPlaceholderHeight` | Integer | The maximum height in pixels of the generated placeholder image. Recommended values are between 6 and 15.<br>Default: `12` |
| `placeholderQuality` | Integer | The JPEG compression quality of the generated placeholder image.<br>Default: `60` |
| `imgSelector` | String | The DOM selector used to find IMG elements in the markup.<br>Default: `img` |
| `transformImgPath` | Function | A function that takes the IMG `src` attribute and returns a string representing the actual path to your image. |
| `cacheFile` | String | Cache image metadata and placeholder images to this filename. Greatly speeds up subsequent builds. Pass an empty string to turn off the cache.<br>Default: `.lazyimages.json` |
| `appendInitScript` | Boolean | Appends code to initialise lazy loading of images to the generated markup. Set this to `false` if you include your own lazy load script.<br>Default: `true` |
| `scriptSrc` | String | The URI for the lazy load script that is injected into the markup via `appendInitScript`.<br>Default: `https://cdn.jsdelivr.net/npm/lazysizes@5/lazysizes.min.js` |
| `className` | String | The class name added to found IMG elements. Do not change this value unless you intend to use your own `scriptSrc`.<br>Default: `lazyload` |

## Example projects

Example projects using the plugin can be found in the 
[`/example`](./example) directory.

- [Basic](./example/basic) - using default configuration
- [Custom selector](./example/custom-selector) - using a custom image
  selector to only target image in certain DIVs

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

See also the list of 
[contributors](https://github.com/liamfiddler/eleventy-plugin-lazyimages/contributors) 
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
