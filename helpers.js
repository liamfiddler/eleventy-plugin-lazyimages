// Ensures relative paths start in the project root
exports.transformImgPath = (src) => {
  if (src.startsWith('/') && !src.startsWith('//')) {
    return `.${src}`;
  }

  return src;
};

// Logs a message prepended with "LazyImages - "
exports.logMessage = (message) => {
  console.log(`LazyImages - ${message}`);
};

// Init script for the plugin that gets injected into the final markup
// (we have to use lowest common denominator JS language features
// because we don't know what the target browser support is)
exports.initScript = function (selector, src, preferNativeLazyLoad) {
  var images = document.querySelectorAll(selector);
  var numImages = images.length;

  if (numImages > 0) {
    if (preferNativeLazyLoad && 'loading' in HTMLImageElement.prototype) {
      for (var i = 0; i < numImages; i++) {
        var keys = ['src', 'srcset'];

        for (var j = 0; j < keys.length; j++) {
          if (images[i].hasAttribute('data-' + keys[j])) {
            var value = images[i].getAttribute('data-' + keys[j]);
            images[i].setAttribute(keys[j], value);
          }
        }
      }

      return;
    }

    for (var i = 0; i < numImages; i++) {
      if (images[i].hasAttribute('loading')) {
        images[i].removeAttribute('loading');
      }
    }

    var script = document.createElement('script');
    script.async = true;
    script.src = src;
    document.body.appendChild(script);
  }
};

// Warns about common issues with custom configs
exports.checkConfig = (config, defaultConfig) => {
  const { appendInitScript, className } = config;
  const isDefaultScriptSrc = config.scriptSrc === defaultConfig.scriptSrc;

  if (!isDefaultScriptSrc && !appendInitScript) {
    console.warn(
      'LazyImages - scriptSrc will be ignored because appendInitScript=false'
    );
  }

  if (
    isDefaultScriptSrc &&
    appendInitScript &&
    !className.includes('lazyload')
  ) {
    console.warn(
      'LazyImages - LazySizes with the default config requires "lazyload" be included in className'
    );
  }
};
