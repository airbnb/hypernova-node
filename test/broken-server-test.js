const assert = require('chai').assert;
const runTest = require('./runTest');
const provideRenderer = require('./rendererProvider').provideRenderer;
const server = require('./server');

function fail(req, res) {
  req.query.error = 'Something is broken';
}

describe('Server is broken', () => {
  beforeEach(() => {
    server.addListener('request', fail);
  });

  it('fall back to client rendering', (done) => {
    runTest(done, provideRenderer, (html) => {
      assert.isString(html, 'fallback html is returned');
      assert.include(html, 'data-hypernova-key', 'hypernova key is in html');
      assert.include(html, 'data-hypernova-id', 'hypernova id is in html');
    });
  });

  afterEach(() => {
    server.removeListener('request', fail);
  });
});
