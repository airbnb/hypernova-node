require('./server');

const runAssertions = require('./runAssertions');

const sampleJobs = {
  SampleComponent: { foo: 1, bar: 2, baz: 3 },
};

function runTest(done, rendererProvider, assertions) {
  const renderer = rendererProvider();

  return renderer.render(sampleJobs).then(html => runAssertions(done, assertions, html), done);
}

module.exports = runTest;
