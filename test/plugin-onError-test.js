const assert = require('chai').assert;
const runTest = require('./runTest');
const provideRendererWithPlugins = require('./rendererProvider').provideRendererWithPlugins;
const sinon = require('sinon');

const error = new Error('oops');

function test(done, pluginDefinition, optionalError) {
  const plugin = Object.assign({
    onError: sinon.stub().returnsArg(0),
  }, pluginDefinition);

  function getRenderer() {
    const renderer = provideRendererWithPlugins(plugin);
    if (optionalError) {
      renderer.url += '?error=' + optionalError;
    }
    return renderer;
  }

  runTest(done, getRenderer, () => {
    assert.ok(plugin.onError.calledOnce, 'onError was called once');
    assert(plugin.onError.returnValues[0] === error, 'the error is the same');
  });
}

describe('when using onError', () => {
  it('should trigger onError if an error is thrown in getViewData', (done) => {
    test(done, {
      getViewData() {
        throw error;
      },
    });
  });

  it('should trigger onError if an error is thrown in prepareRequest', (done) => {
    test(done, {
      prepareRequest: () => {
        throw error;
      },
    });
  });

  it('should trigger onError if an error is thrown in shouldSendRequest', (done) => {
    test(done, {
      shouldSendRequest() {
        throw error;
      },
    });
  });

  it('should trigger onError if an error is thrown in willSendRequest', (done) => {
    test(done, {
      willSendRequest() {
        throw error;
      },
    });
  });

  it('should trigger onError if an error is thrown in afterResponse', (done) => {
    test(done, {
      afterResponse() {
        throw error;
      },
    });
  });

  it('should trigger onError if an error exists in the response', () => {
    return test(() => {}, {}, new Error('Pancake Sandwich'));
  });
});
