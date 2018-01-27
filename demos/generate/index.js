// create an express app
import 'source-map-support/register';
import fs from 'fs';
import path from 'path';

import l from '../../helpers/setupAndLogger';
import { generate } from '../../lib';

/* eslint object-curly-newline: ["error", { "multiline": true }] */
const qrs = [
  { name: 'our-wifi', logo: 'wifi', text: 'WIFI:S:HomeWifi;T:WPA;P:MySeCRETPassW0rd!;H:true;;', ratio: 1.6 },
  { name: 'AirBnbHQ', logo: 'airbnb', text: 'geo:37.7708221,-122.406815', ratio: 1.6 },
  { name: 'iPhonesOnEBay', logo: 'ebay', text: 'https://www.ebay.com/b/Apple-iPhone/9355/bn_319682', ratio: 1.4 },
  { name: 'NyanCat', logo: 'youtube', text: 'https://www.youtube.com/watch?v=wZZ7oFKsKzY', ratio: 2 },
  { name: 'MrJs', logo: 'twitter', text: 'https://twitter.com/jeresig', ratio: 1.4 },
  { name: 'callMe', logo: 'whatsup', text: 'tel:+18017891234', ratio: 1.8, ec: 'H' },
  { name: 'SMSHere', logo: 'phone', text: 'smsto:+18017891234:Hi! QR Codes are fun!', ratio: 1.4 },
  { name: 'here', logo: 'here', text: 'geo:37.7708221,-122.406815', ratio: 1.6 },
  { name: 'apple', logo: 'apple', text: 'https://www.apple.com', ratio: 1.8 },
  { name: 'playstation', logo: 'playstation', text: 'https://www.playstation.com/en-us/explore/ps4', ratio: 1.4 },
  { name: 'supermanEmail', logo: 'superman', text: 'mailto:superman@krypton.com', ratio: 1.6 },
];

// route handler for GET /airbnb?t=ccc
for (let i = 0; i < qrs.length; i++) {
  ((qr) => { // eslint-disable-line
    const logoPath = path.resolve(__dirname, `../../images/final/${qr.logo}-resized.png`);
    const dst = path.resolve(__dirname, `./output/${qr.name}.png`);
    generate({
      text: qr.text,
      path: logoPath,
      ratio: qr.ratio,
      opt: { errorCorrectionLevel: qr.ec || 'Q', margin: 2 },
    }).then((buf) => {
      fs.writeFile(dst, buf, (err) => {
        if (err) {
          return l.error(err);
        }
        return l.info(dst, 'saved.');
      });
    });
  })(qrs[i]);
}
