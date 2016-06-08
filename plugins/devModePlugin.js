function renderStack(error) {
  const stack = Array.isArray(error.stack) ? error.stack : error.stack.split('\n');
  return stack.map(line => `<li>${line}</li>`).join('\n');
}

function renderError(component, error) {
  return `
    <div style="background-color: #ff5a5f; color: #fff; padding: 12px;">
      <p style="margin: 0">
        <strong>Development Warning!</strong>
        The <code>${component}</code> component failed to render with Hypernova. Error stack:
      </p>
      <ul style="padding: 0 20px">
        ${renderStack(error)}
      </ul>
    </div>
  `;
}

const devModePlugin = {
  prepareRequest(req) {
    Object.keys(req).forEach(job => console.log('Preparing', job, req[job].data));
    return req;
  },

  willSendRequest(req) {
    Object.keys(req).forEach(job => console.log('Requesting', job, req[job].data));
  },

  afterResponse(res) {
    return Object.keys(res).reduce((str, name) => {
      if (res[name].error) {
        return str + renderError(name, res[name].error);
      }
      return str + res[name].html;
    }, '');
  },

  onError(err) {
    console.error(err.stack);
  },
};

module.exports = devModePlugin;
