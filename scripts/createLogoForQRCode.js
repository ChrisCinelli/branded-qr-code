import Jimp from 'jimp';
import globby from 'globby';
import path from 'path';

import l from '../helpers/setupAndLogger';

l.enableAll();

// ////////
// Create the log images with the background
// Run AFTER `node createGaussianBlur.js`
// ////////
globby(path.resolve(__dirname, '../images/tmp/*-resized.png')).then((files) => {
  for (let i = 0; i < files.length; i++) {
    const src = files[i];
    const srcGaussian = path.resolve(__dirname, `../images/tmp/${path.basename(src, '.png')}-gaussianblur.png`);
    const dst = path.resolve(__dirname, `../images/final/${path.basename(src, '.png')}.png`);
    l.info('Processing', src);

    Jimp.read(srcGaussian).then((imgGauss) => {
      Jimp.read(src).then((img) => {
        new Jimp(img.bitmap.width, img.bitmap.height, ((err, empty) => { // eslint-disable-line
          const m = imgGauss.clone();
          const m2 = imgGauss.clone().invert();
          const m3 = empty
            .clone()
            .opaque()
            .composite(m.composite(m2, 0, 0), 0, 0)
            .brightness(0.475)
            .contrast(1);
          const white = empty.clone().opaque().invert();

          white.mask(m3, 0, 0).clone().composite(img, 0, 0).write(dst);
        }));
      });
    }).catch((error) => {
      l.error(error);
    });
  }
});
