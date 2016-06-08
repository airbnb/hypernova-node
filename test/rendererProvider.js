const Renderer = require('../');

const URL = 'http://localhost:28001/';

exports.provideRendererWithPlugins = (pluginDefinition) => {
  const plugin = Object.assign({
    afterResponse: res => res,
  }, pluginDefinition);

  return new Renderer({
    url: URL,
    plugins: [plugin],
  });
};

exports.provideRenderer = () => {
  return new Renderer({
    url: URL,
  });
};
