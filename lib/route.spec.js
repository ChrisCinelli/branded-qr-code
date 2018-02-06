import request from 'supertest';
import express from 'express';
import isBuffer from 'is-buffer';

import _route from './route';

const app = express();

function errorFn(req, res, err) {
  // Do not make too much noise
  // console.error(err.stack || new Error(err.error || err).stack);
  res.status(404).json(err);
}

app.get('/qr-error', _route({ onError: errorFn }));
app.get('/qr-simple-text', _route({ text: 'some text', getText: false, onError: errorFn }));
app.get('/qr-gettext', _route({ logoPath: '../images/final/airbnb-resized.png', onError: errorFn }));
app.get('/qr-bogus-path', _route({ text: 'some text', logoPath: 'bogus.png', onError: errorFn }));
app.get('/qr-gettext-error', _route({ getText: () => Promise.reject(new Error('some error')), onError: errorFn }));


describe('QR Route', () => {
  it('Should error for no text', () => request(app)
    .get('/qr-error')
    .expect(404)
    .then((res) => {
      expect(isBuffer(res.body)).toBe(false);
      expect(res.body.error).toBe('NOTEXT');
    }));

  it('Should error for no path', () => request(app)
    .get('/qr-simple-text')
    .expect(404)
    .then((res) => {
      expect(isBuffer(res.body)).toBe(false);
      expect(res.body.error).toBe('NOLOGOPATH');
    }));

  it('Should return a logo', () => request(app)
    .get('/qr-gettext?t=dummy')
    .expect(200)
    .then((res) => {
      expect(isBuffer(res.body)).toBe(true);
      expect(res.body.error).toBe(undefined);
    }));

  it('Should complain about no text', () => request(app)
    .get('/qr-gettext')
    .expect(404)
    .then((res) => {
      expect(isBuffer(res.body)).toBe(false);
      expect(res.body.error).toBe('NOTEXT');
    }));

  it('Should throw becasue logo does not exist', () => request(app)
    .get('/qr-bogus-path')
    .expect(404)
    .then((res) => {
      expect(isBuffer(res.body)).toBe(false);
      expect(res.body.error.errno).toBe(-2);
    }));

  it('Should throw becasue logo does not exist', () => request(app)
    .get('/qr-gettext-error')
    .expect(404)
    .then((res) => {
      expect(isBuffer(res.body)).toBe(false);
      expect(res.body.error).toBe('GETTEXT-EXCEPTION');
    }));
});
