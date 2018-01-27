import Jimp from 'jimp';
import globby from 'globby';
import path from 'path';

import l from '../helpers/setupAndLogger';

l.enableAll();


// ////////
// Resize to 512 (including padding)
// ////////

const finalSize = 1024;

globby(path.resolve(__dirname, '../images/original/*.png')).then((files) => {
  for (let i = 0; i < files.length; i++) {
    const src = files[i];
    const dst = path.resolve(__dirname, `../images/tmp/${path.basename(src, '.png')}-resized.png`);
    l.info('Processing', src, ' -> ', dst);

    Jimp.read(src).then((img) => {
      let w;
      let h;
      let s;

      if (img.bitmap.width < img.bitmap.height) {
        w = Jimp.AUTO;
        h = Math.floor(Math.min(finalSize, img.bitmap.height * 2) / 2);
        s = h * 2;
      } else {
        w = Math.floor(Math.min(finalSize, img.bitmap.width * 2) / 2);
        h = Jimp.AUTO;
        s = w * 2;
      }

      img.resize(w, h);

      const x = Math.floor((s - img.bitmap.width) / 2);
      const y = Math.floor((s - img.bitmap.height) / 2);
      new Jimp(s, s, (err, empty) => { // eslint-disable-line
        empty.composite(img, x, y).write(dst);
      });
    }).catch((error) => {
      l.error(error);
    });
  }
});
