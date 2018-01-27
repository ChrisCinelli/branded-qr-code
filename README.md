# Create branded QRcodes
NPM module to create QR Codes with a logo like these...

![callme](https://user-images.githubusercontent.com/153101/35560379-1776225e-0562-11e8-96ea-39fd652dbdce.png)

![apple](https://user-images.githubusercontent.com/153101/35560374-1388f6da-0562-11e8-9218-69f72dd2d8e1.png)
![here](https://user-images.githubusercontent.com/153101/35560384-193b94c0-0562-11e8-9025-afab53dc4092.png)
![mrjs](https://user-images.githubusercontent.com/153101/35560394-1f50e1ee-0562-11e8-9e58-cf1fff8e5fb2.png)
![supermanemail](https://user-images.githubusercontent.com/153101/35560404-28c72fa8-0562-11e8-8547-60dee1d787ad.png)

![playstation](https://user-images.githubusercontent.com/153101/35560401-25774a4a-0562-11e8-8c48-75913b892d9d.png)
![smshere](https://user-images.githubusercontent.com/153101/35560402-25eecbec-0562-11e8-864f-7be39e8711a6.png)
![nyancat](https://user-images.githubusercontent.com/153101/35560416-346a7e8c-0562-11e8-93f2-7fb7a3b31b3d.png)

![our-wifi](https://user-images.githubusercontent.com/153101/35560397-2190d950-0562-11e8-96a5-8bd33af8429a.png)
![iphonesonebay](https://user-images.githubusercontent.com/153101/35560390-1bf69912-0562-11e8-828e-c71aa38deee1.png)


# Install
```
yarn add branded-qr-code babel-polyfill
```

# Use
```
// ESNext Modules
import 'babel-polyfill';
import brandedQRCode from 'branded-qr-code';
// Or old good syntax
// require('babel-polyfill');
// var brandedQRCode = require('branded-qr-code');

// Return a buffer with the PNG of the code
brandedQRCode.generate({text: 'https://www.google.com', path: 'mylogo.png'});

// For express if you need different logos:
app.get('/qr/:logo', route({ getLogoPath: req => `../images/original/${req.params.logo}.png` }));

```

# Examples
[Standard express server](demos/express/index.js) - Check the demo with `npm run demo`. Try  `localhost:3000/qr/twitter?t=www.twitter.com`.

[Batch Processing](demos/generate/index.js) - Check the demo with `npm run demo-generate`. Files are saved in `demos/generate/output`.

# Syntax

```
// Return a Buffer with the QRCode's PNG
brandedQRCode.generate( opts )
```

* `opts`:
  * `text`: text for the QR code.
  * `path`: path of the logo.
  * `ratio`: The QR code width and height will be `1/ratio` of the QRcode image size (default `2`).
  * `ignoreCache`: Ignore the cached images (default: `false`).
  * `opt`: Options for [npm `qrcode` module](https://github.com/soldair/node-qrcode/tree/6b5e5b1b6a147e2c463ebf53d6e5019cf1df9aa3) (defaults: `{ errorCorrectionLevel: 'M', margin: 2 }`).


```
// Return an express route that serves the QRCode's PNG
brandedQRCode.route( opts )
```

* `opts`:
  * `text`: Text in the QR code. It is only used if `getText` is falsy. If you want to return QR code with dynamic text you will not use this.
  * `getText`: Function that returns the text in the QRcode. It receives the `req` object (default `req => req.query.t`). It can return a promise.
  * `logoPath`: Path to the image to be added in the center of the QRcode. It is only used if `getLogoPath` is falsy.
  * `getLogoPath`: Function that returns the path of the logo. It receives the `req` object.
  * `getRatio`: Function that returns the `ratio` to use. It receives the `req` object.
  * `getLogoPath`: Function that returns the text to be put in the QRcode. It receives the `req` object. It can return a promise.
  * `ignoreCache`: Ignore the cached images (default: `false`).
  * `qrOpt`: Options for [npm `qrcode` module](https://github.com/soldair/node-qrcode/tree/6b5e5b1b6a147e2c463ebf53d6e5019cf1df9aa3) (defaults: `{ errorCorrectionLevel: 'M', margin: 2 }`).
  * `maxAge`: The cache header to be added. `false` means no cache. Default 31557600 (1 year).
  * `onError`: `function(req, res, err)` called in case of an error. The default function log the error and return a 404.

# Utilities
There are some [`/scripts`](/scripts) that can help you to create a better looking logos adding some white margin around it.
Just place your logo in [`/images/original`](/images/original) and then, run in order:

1. [`npm run resize`](/scripts/createResized.js)
2. [`npm run gaussian`](/scripts/createGaussianBlur.js)
3. [`npm run finalize`](/scripts/createLogoForQRCode.js)

You will find your logo nicely padded in [`/images/final`](/images/final)

# More about QRcodes
The logo at the center of the QRcode is actually adding noise. The QR code can still be decoded because QR codes have redundant data that readers' error correction algorithms can use. The npm `qrcode` library supports [different levels](https://github.com/soldair/node-qrcode/tree/6b5e5b1b6a147e2c463ebf53d6e5019cf1df9aa3#error-correction-level). Higher levels produce denser the QR codes. From empirical tests you can noticed that using Low (`L`) usually produces QR codes that are NOT READABLE. Medium (`M`) is the `default` and it is usually sufficient. If you have problems, you may want to use quartile (`Q`) or high (`H`). You can do it with `{ errorCorrectionLevel: 'Q' }`.

# Development notes:
- Execution with Babel (env preset) in [.babelrc](./.babelrc). Only compile what is not available. Support for (`import`/`export`).
- Bundling with [rollup](https://rollupjs.org/) in one distribution file (with sourcemaps).
- Building for node 4 with (env preset) in [.babelrc-build](./.babelrc-build) in `/dist`.
- Linting with ESLint (setup your lint in [.eslintrc.js](./.eslintrc.js) - currently set with ebay template).
- Test with [JEST](https://facebook.github.io/jest/docs/en/getting-started.html)
  - Test are in `.spec.js` files.
  - Coverage test enforced (currently 50%) but you can change it in the [package.json](./package.json).
- Pre-commit hook runs tests and linting (with `--fix` so you do not waste time).
- Set up node version with nvm in `.nvmrc`.
- `npm publish` run test and build the repo.
-  Step by step debugging with `npm run debugTest` (use with [`chrome://inspect`](https://medium.com/the-node-js-collection/debugging-node-js-with-google-chrome-4965b5f910f4)).
-  Watching tests with `watch:test` (use it while you develop!)
-  Coverage with `npm run cover` and HTML report in the browser with `npm run coverHTML`
