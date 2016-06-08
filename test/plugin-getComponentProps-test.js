const assert = require('chai').assert;
const Renderer = require('../');
const provideRendererWithPlugins = require('./rendererProvider').provideRendererWithPlugins;
const runTest = require('./runTest');

function test(equalsObj) {
  return (props) => {
    assert.deepEqual(
      props.SampleComponent.job.data,
      equalsObj,
      'The data of SampleComponent was transformed'
    );
  };
}

describe('when using getViewData', () => {
  it('should alter the props', (done) => {
    const plugin = {
      getViewData(name, props) {
        if (name === 'SampleComponent') {
          return { foo: 0 };
        }
        return props;
      },
    };

    runTest(done, () => provideRendererWithPlugins(plugin), test({
      foo: 0,
    }));
  });

  it('should still do stuff if you do not return anything', (done) => {
    const plugin = {
      getViewData() { },
    };

    runTest(done, () => provideRendererWithPlugins(plugin), test(undefined));
  });
});
