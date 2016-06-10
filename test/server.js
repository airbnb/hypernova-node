const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.post('/', (req, res) => {
  res.send({
    error: null,
    results: Object.keys(req.body).reduce((obj, key) => {
      obj[key] = {
        error: req.query.error ? new Error(req.query.error) : null,
        html: `<div>${JSON.stringify(req.body[key].data)}</div>`,
      };
      return obj;
    }, {}),
  });
});

module.exports = app.listen(28001);
