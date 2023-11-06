const fs = require('fs');

// A global to store the cache data in memory
let lazyImagesCache = {};

// Loads the cache data into memory
exports.load = (cacheFile) => {
  if (!cacheFile) {
    return;
  }

  try {
    if (fs.existsSync(cacheFile)) {
      const cachedData = fs.readFileSync(cacheFile, 'utf8');
      lazyImagesCache = JSON.parse(cachedData);
    }
  } catch (e) {
    console.error('LazyImages - cacheFile', e);
  }
};

// Reads the cached data for an image
exports.read = (imageSrc) => {
  if (imageSrc in lazyImagesCache) {
    return lazyImagesCache[imageSrc];
  }

  return undefined;
};

// Updates image data in the cache
exports.update = (cacheFile, imageSrc, imageData) => {
  lazyImagesCache[imageSrc] = imageData;

  if (cacheFile) {
    const cacheData = JSON.stringify(lazyImagesCache);

    fs.writeFile(cacheFile, cacheData, (err) => {
      if (err) {
        console.error('LazyImages - cacheFile', err);
      }
    });
  }
};
