const express = require('express');
const Renderer = require('../');
const devModePlugin = require('../plugins/devModePlugin');

const app = express();

const renderer = new Renderer({
  url: 'http://localhost:3030/batch',
  plugins: [
    devModePlugin,
  ],
});

app.get('/', (req, res) => {
  const jobs = {
    MyComponent: { name: req.query.name || 'Stranger' },
    Component2: { text: 'Hello World' },
  };

  renderer.render(jobs).then(html => res.send(html));
});

app.listen(8080, () => console.log('Now listening'));
