import run from 'express-unit';
import _route from './route';

describe('QR Route', () => {
  it('Should call next', () => {
    const setup = jest.fn((req, res, next) => next());
    const route = jest.fn(_route());
    run(setup, route);
    expect(setup).toHaveBeenCalled();
    expect(route).toHaveBeenCalled();
  });
});
