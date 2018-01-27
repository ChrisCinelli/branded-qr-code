// create an express app
import 'source-map-support/register';
import express from 'express';

import l from '../../helpers/setupAndLogger';
import { route } from '../../lib';

l.enableAll();


const app = express();
const port = process.env.PORT || 3000;

// route handler for GET /airbnb?t=ccc
app.get('/qr/:logo', route({
  getLogoPath: req => `../images/final/${req.params.logo}-resized.png`,
  getRatio: req => parseFloat(req.query.r, 10) || 2,
}));

app.listen(port);

l.log('server started on port %s', port);
