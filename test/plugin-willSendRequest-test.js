const assert = require('chai').assert;
const sinon = require('sinon');
const runTest = require('./runTest');
const provideRendererWithPlugins = require('./rendererProvider').provideRendererWithPlugins;

function test(pluginDefinition, assertions, done) {
  runTest(done, () => provideRendererWithPlugins(pluginDefinition), assertions);
}

describe('plugin willSendRequest', () => {
  it('should call willSendRequest', (done) => {
    const willSendRequest = sinon.spy();

    test({ willSendRequest }, () => {
      assert(willSendRequest.calledOnce, 'willSendRequest was called once');
      assert(willSendRequest.args[0].length === 1, 'willSendRequest only gets one arg');

      assert.isObject(willSendRequest.args[0][0].SampleComponent, 'the jobs hash exists');

      const job = willSendRequest.args[0][0].SampleComponent;

      assert.isString(job.name);
      assert.isObject(job.data);
    }, done);
  });
});
