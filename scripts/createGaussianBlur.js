import Jimp from 'jimp';
import globby from 'globby';
import path from 'path';

import l from '../helpers/setupAndLogger';

l.enableAll();

// ////////
// Create a gaussian blur. Since it take a while we save it on disk.
// ////////
globby(path.resolve(__dirname, '../images/tmp/*-resized.png')).then((files) => {
  for (let i = 0; i < files.length; i++) {
    const src = files[i];
    const dst = path.resolve(__dirname, `../images/tmp/${path.basename(src, '.png')}-gaussianblur.png`);
    l.info('Processing', src, ' -> ', dst);
    Jimp.read(src).then((img) => {
      img
        .greyscale()
        .gaussian(8)
        .write(dst);
    }).catch((error) => {
      l.error(error);
    });
  }
});
