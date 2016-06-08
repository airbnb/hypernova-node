const assert = require('chai').assert;
const sinon = require('sinon');
const Renderer = require('../');
const runTest = require('./runTest');
const provideRenderer = require('./rendererProvider').provideRenderer;
const runAssertions = require('./runAssertions');

describe('default case', () => {
  it('should not blow up if no plugins exist', (done) => {
    runTest(done, provideRenderer, (html) => {
      assert.isString(html, 'html is passed back');
    });
  });

  it('should throw if a config is not passed', () => {
    assert.throws(() => {
      new Renderer();
    }, TypeError);
  });

  it('should be able to add plugins dynamically', (done) => {
    const renderer = provideRenderer();
    const onError = sinon.spy();

    renderer.addPlugin({
      shouldSendRequest() {
        throw new Error('Nope');
      },
      onError,
    });

    renderer.render({}).then(() => {
      runAssertions(done, () => {
        assert(onError.calledOnce, 'onError was called because server could not be reached');
      });
    });
  });
});
