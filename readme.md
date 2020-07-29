# LazyImages plugin for [11ty](https://www.11ty.io/)

![Banner image](https://repository-images.githubusercontent.com/190408612/4305b000-94d2-11e9-922c-72a93cafadcf)

What this plugin does:

- 🔍 Finds IMG elements in your markup
- ➕ Adds width and height attributes to the element
- ✋ Defers loading the image until it is in/near the viewport
  (lazy loading)
- 🖼️ Displays a blurry low-res placeholder until the image has loaded
  (<abbr title="Low Quality Image Placeholder">LQIP</abbr>)

This plugin supports:

- Any 11ty template format that outputs to a .html file
- Absolute and relative image paths
- Custom image selectors; target all images or only images in a certain part
  of the page
- Placeholder generation for all image formats supported by
  [Sharp](https://sharp.pixelplumbing.com/); JPEG, PNG, WebP, TIFF, GIF, & SVG
- Responsive images using `srcset`; the image in the `src` attribute will be
  used for determining the placeholder image and width/height attributes

---

**v2 just released! [View the release/upgrade notes](#upgrade-notes)**

---

**Like this project? Buy me a coffee! [PayPal](https://paypal.me/liamfiddler) [ko-fi](https://ko-fi.com/liamfiddler)**

---

## Getting started

### Install the plugin

In your project directory run:

```sh
# Using npm
npm install eleventy-plugin-lazyimages --save-dev

# Or using yarn
yarn add eleventy-plugin-lazyimages --dev
```

Then update your project's `.eleventy.js` to include the plugin:

```js
const lazyImagesPlugin = require('eleventy-plugin-lazyimages');

module.exports = function (eleventyConfig) {
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

| Key                    | Type     | Description                                                                                                                                                                   |
| ---------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maxPlaceholderWidth`  | Integer  | The maximum width in pixels of the generated placeholder image. Recommended values are between 15 and 40.<br>Default: `25`                                                    |
| `maxPlaceholderHeight` | Integer  | The maximum height in pixels of the generated placeholder image. Recommended values are between 15 and 40.<br>Default: `25`                                                   |
| `imgSelector`          | String   | The DOM selector used to find IMG elements in the markup.<br>Default: `img`                                                                                                   |
| `transformImgPath`     | Function | A function that takes the IMG `src` attribute and returns a string representing the actual file path to your image.                                                           |
| `cacheFile`            | String   | Cache image metadata and placeholder images to this filename. Greatly speeds up subsequent builds. Pass an empty string to turn off the cache.<br>Default: `.lazyimages.json` |
| `appendInitScript`     | Boolean  | Appends code to initialise lazy loading of images to the generated markup. Set this to `false` if you include your own lazy load script.<br>Default: `true`                   |
| `scriptSrc`            | String   | The URI for the lazy load script that is injected into the markup via `appendInitScript`.<br>Default: `https://cdn.jsdelivr.net/npm/lazysizes@5/lazysizes.min.js`             |
| `preferNativeLazyLoad` | Boolean  | Use the native browser `loading="lazy"` instead of the lazy load script (if available).<br>Default: `false`                                                                   |
| `className`            | String[] | The class names added to found IMG elements. You usually don't need to change this unless you're using a different `scriptSrc`.<br>Default: `['lazyload']`                    |

## Example projects

Example projects using the plugin can be found in the
[`/example`](./example) directory.

- [Basic](./example/basic) - using default configuration
- [Custom selector](./example/custom-selector) - using a custom image selector to only target image in certain DIVs
- [Usage with eleventy-plugin-local-images](./example/eleventy-plugin-local-images) - using this plugin with [eleventy-plugin-local-images](https://github.com/robb0wen/eleventy-plugin-local-images)
- [Usage with vanilla-lazyload](./example/verlok-vanilla-lazyload) - using this plugin with [vanilla-lazyload](https://www.npmjs.com/package/vanilla-lazyload)

## Built with

- [JSDOM](https://github.com/jsdom/jsdom) - To find and modify image
  elements in 11ty's generated markup
- [Sharp](https://sharp.pixelplumbing.com/) - To read image
  metadata and generate low-res placeholders
- [LazySizes](https://github.com/aFarkas/lazysizes) - Handles lazy loading

## Contributing

This project welcomes suggestions and Pull Requests!

## Authors

- **Liam Fiddler** - _Initial work / maintainer_ - [@liamfiddler](https://github.com/liamfiddler)

See also the list of
[contributors](https://github.com/liamfiddler/eleventy-plugin-lazyimages/contributors)
who participated in this project.

## License

This project is licensed under the MIT License -
see the [LICENSE](LICENSE) file for details

## Acknowledgments

- The wonderfully supportive team at
  [Mentally Friendly](https://mentallyfriendly.com)
- Everyone who has contributed to the
  [11ty](https://www.11ty.io/) project, without whom
  this plugin wouldn't run
- [José M. Pérez's blog post about progressive image loading](https://jmperezperez.com/medium-image-progressive-loading-placeholder/)
  which served as the inspiration for this plugin
- [Addy Osmani's blog post about lazy loading](https://addyosmani.com/blog/lazy-loading/)
  which served as the inspiration for the init script

## Common questions

### Can I host the lazy load script locally?

Yes! This plugin defaults to
[LazySizes from JSDelivr](https://cdn.jsdelivr.net/npm/lazysizes@5/lazysizes.min.js)
but you can specify a relative path via the `scriptSrc` configuration option.

### Does my local image path have to match the output path?

**(a.k.a Why do I have "Input file is missing" messages in my terminal?)**

By default this plugin assumes the file referenced in a `src` attribute like
`<img src="/images/dog.jpg" />` exists at `<project root>/images/dog.jpg` or
`<project root>/src/images/dog.jpg`.

If you prefer to store your images elsewhere the `transformImgPath` config
option allows you to specify a function that points the plugin to your
internal image path.

For example, if your file structure stores `<img src="/images/dog.jpg" />`
at `<project root>/assets/dog.jpg` you could set `transformImgPath` like:

```js
// .eleventy.js
eleventyConfig.addPlugin(lazyImagesPlugin, {
  transformImgPath: (imgPath) => imgPath.replace('/images/', './assets/'),
});
```

(In the future we hope to make the plugin automatically manage these paths,
once a fix for [eleventy/issues/789](https://github.com/11ty/eleventy/issues/789)
is completed)

### Can I use a different lazy load script?

Yes! By default this plugin uses [LazySizes](https://github.com/aFarkas/lazysizes)
to handle lazy loading, but any lazy load script that reads from the `data-src`
attribute is supported via the `scriptSrc` configuration option.

We've included an [example project in this repo](./example/verlok-vanilla-lazyload)
demonstrating this plugin using
[vanilla-lazyload](https://www.npmjs.com/package/vanilla-lazyload).

Note: if you need to modify the custom script's parameters the recommended approach
is to set `appendInitScript: false` in this plugin's config. This tells the plugin
to skip adding the script loader code to the page. It ignores any value set for
scriptSrc and allows you to use your own method for including the custom script.
The plugin will still set the `data-src` + `width` + `height` attributes on IMG
tags and generate the low quality image placeholders, it just doesn't manage the
actual lazy loading.

### Can I use this plugin with a plugin that moves/renames image files?

Yes! The key to solving this problem is the order in which the plugins are
defined in `.eleventy.js`. It is important this plugin runs after the plugin
that moves/renames files otherwise this plugin may still be referencing the
original filepath in the markup, not the one generated by the other plugin.

We've included an
[example project in this repo](./example/eleventy-plugin-local-images)
demonstrating this plugin with
[eleventy-plugin-local-images](https://github.com/robb0wen/eleventy-plugin-local-images).

## Upgrade notes

### v2.0.0

The underlying tool used to generate placeholders has switched from JIMP to Sharp.
This allows the plugin to handle a greater variety of image formats, while also increasing in speed.

The API remains largely the same so most sites should not need to adjust their config.

- The default values for `maxPlaceholderWidth` and `maxPlaceholderHeight` have been increased from 12 to 25 - this increases the quality of the LQIP without a significant change in filesize
- `placeholderQuality` has been removed - at the size of the LQIP it didn't make much of a difference to filesize or image quality
- The default value for `preferNativeLazyLoad` is now `false` - most users install this plugin to generate LQIP and the previous default meant the LQIP weren't visible in modern browsers

---

**Like this project? Buy me a coffee! [PayPal](https://paypal.me/liamfiddler) [ko-fi](https://ko-fi.com/liamfiddler)**

---
