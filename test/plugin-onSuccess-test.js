const assert = require('chai').assert;
const Renderer = require('../');
const provideRendererWithPlugins = require('./rendererProvider').provideRendererWithPlugins;
const runTest = require('./runTest');
const sinon =  require('sinon');

describe('when using onSuccess', () => {
  it('calls onSuccess with all the successful jobs', (done) => {
    const plugin = {
      onSuccess: sinon.stub().returnsArg(0),
    };

    runTest(done, () => provideRendererWithPlugins(plugin), () => {
      assert.ok(plugin.onSuccess.calledOnce, 'onError was called once');
      assert.isObject(plugin.onSuccess.returnValues[0]);
      assert.isObject(plugin.onSuccess.returnValues[0].SampleComponent);
    });
  });
});
