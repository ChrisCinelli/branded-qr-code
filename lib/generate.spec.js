import isBuffer from 'is-buffer';

import generate from './generate';

describe('generate', () => {
  it('should create QR code', (done) => {
    generate({
      text: 'https://www.google.com',
      path: '../images/original/airbnb.png',
      ignoreCache: false,
    }).then((buf) => {
      expect(isBuffer(buf)).toBe(true);
      done();
    });
  });

  it('should not create QR code if text is undefined', () => expect(generate({
    text: undefined,
    path: '../images/original/airbnb.png',
    ignoreCache: false,
  })).rejects.toThrow());
});
