import l from 'loglevel';

global.Promise = require('bluebird');

Promise.config({
  longStackTraces: true,
});

process.on('unhandledRejection', (reason, p) => {
  l.warn('Possibly Unhandled Rejection at: Promise ', p, ' reason: ', reason);
});

export default l;
