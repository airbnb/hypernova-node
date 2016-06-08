const assert = require('chai').assert;
const sinon = require('sinon');
const runTest = require('./runTest');
const provideRendererWithPlugins = require('./rendererProvider').provideRendererWithPlugins;

function test(pluginDefinition, equalsObj, done) {
  runTest(done, () => provideRendererWithPlugins(pluginDefinition), (jobs) => {
    Object.keys(jobs).forEach((name) => {
      assert.deepEqual(
        jobs[name].job,
        equalsObj[name],
        'The jobs hash matches with what is expected'
      );
    });
  });
}

describe('plugin prepareRequest', () => {
  it('should alter the jobs hash', (done) => {
    const decoratedJobs = {
      SampleComponent: {
        name: 'SampleComponent',
        data: { a: 1, b: 2, c: 3 },
        extras: Math.random(),
      },
    };

    test({
      prepareRequest(jobs) {
        return decoratedJobs;
      },
    }, decoratedJobs, done);
  });

  it('should not fire an empty request', (done) => {
    test({
      prepareRequest(jobs) {
        return {};
      },
    }, {}, done);
  });

  it('should work if you just pass in the jobs', (done) => {
    const jobsHash = {};

    test({
      prepareRequest(jobs) {
        Object.assign(jobsHash, jobs);

        return jobs;
      },
    }, jobsHash, done);
  });

  it('should receive two arguments', (done) => {
    const spy = sinon.spy();
    test({
      prepareRequest() {
        spy.apply(spy, arguments);
      },
    }, () => {
      assert(spy.calledOnce, 'prepareRequest was called');
      assert(spy.args[0].length === 2, 'Two arguments are received');
    }, done);
  });
});
