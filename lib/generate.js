import Jimp from 'jimp';

import QRCode from 'qrcode';

import pathModule from 'path';

import cachePromise from './cache-promise';

function createImageFromBuffer(imgBuffer) {
  return new Promise((res) => {
    new Jimp(imgBuffer, ((err, img) => { // eslint-disable-line no-new
      if (err) throw err;
      res(img);
    }));
  });
}

function createQRCode(data, opt = { errorCorrectionLevel: 'M', margin: 2 }) {
  return new Promise((res) => {
    QRCode.toBuffer(data, opt, (err, imgBuffer) => {
      if (err) throw err;
      res(createImageFromBuffer(imgBuffer));
    });
  });
}

// TODO: Configurable cache params
export const cacheLogo = cachePromise();
export const cacheLogoResized = cachePromise();

function fetchLogo(_logoPath) {
  const logoPath = _logoPath[0] === '/' || _logoPath[0] === '\\' ? _logoPath : pathModule.resolve(__dirname, _logoPath);
  return Jimp.read(logoPath);
}

function resizeSquared(img, _w, _h) {
  let w;
  let h;

  if (_h > _w) {
    w = Jimp.AUTO;
    h = _h;
  } else {
    w = _w;
    h = Jimp.AUTO;
  }
  return img.resize(w, h);
}

function getResizedLogo({
  path, w, h, ignoreCache = false,
}) {
  if (ignoreCache) {
    return fetchLogo(path).then((img) => resizeSquared(img, w, h));
  }

  const resizedLogoKey = `${w}x${h}-${path}`;
  return cacheLogoResized.getAsync(resizedLogoKey, async () => {
    const logoFullImg = await cacheLogo.getAsync(path, () => fetchLogo(path));
    return resizeSquared(logoFullImg.clone(), w, h);
  });
}

export default async function generate({
  text, path, opt, ignoreCache, ratio = 2,
}) {
  const img = await createQRCode(text, opt);
  const logo = await getResizedLogo({
    path,
    w: Math.floor(img.bitmap.width / ratio),
    h: Math.floor(img.bitmap.height / ratio),
    ignoreCache,
  });

  // Center the logo
  const x = Math.floor((img.bitmap.width - logo.bitmap.width) / 2);
  const y = Math.floor((img.bitmap.height - logo.bitmap.height) / 2);

  // Apply on the QRCode
  const qrImg = img.composite(logo, x, y);

  return new Promise((res, rej) => {
    qrImg.getBuffer(Jimp.MIME_PNG, (err, buf) => {
      if (err) return rej(err);
      return res(buf);
    });
  });
}
