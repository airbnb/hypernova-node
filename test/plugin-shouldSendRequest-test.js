'use strict';

const assert = require('chai').assert;
const sinon = require('sinon');
const runTest = require('./runTest');
const provideRenderer = require('./rendererProvider').provideRenderer;
const server = require('./server');

let globalSpy = sinon.spy();

function test(pluginDefinitions, callCount, done) {
  const renderer = provideRenderer();
  renderer.plugins = pluginDefinitions;
  runTest(done, () => renderer, (jobs) => {
    assert.equal(globalSpy.callCount, callCount, `The global spy was called ${callCount} times`);
  });
}

describe('plugin shouldSendRequest', () => {
  beforeEach(() => {
    globalSpy = sinon.spy();
    server.addListener('request', globalSpy);
  });

  it('should fire a request if true', (done) => {
    test([{
      shouldSendRequest() {
        return true;
      },
    }], 1, done);
  });

  it('should not fire a request if false', (done) => {
    test([{
      shouldSendRequest() {
        return false;
      },
    }], 0, done);
  });

  it('should not fire a request if ANY plugin returns false', (done) => {
    test([
      {
        shouldSendRequest() {
          return false;
        },
      },
      {
        shouldSendRequest() {
          return true;
        },
      },
    ], 0, done);
  });

  afterEach(() => {
    server.removeListener('request', globalSpy);
  });
});
