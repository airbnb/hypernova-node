const axios = require('axios');
const values = require('object.values');
const uuidV4 = require('uuid/v4');

function reduce(obj, init, f) {
  return Object.keys(obj).reduce((a, b) => f(a, b), init);
}

function encode(obj) {
  return JSON.stringify(obj).replace(/-->/g, '--&gt;');
}

function renderHTML(viewName, data) {
  const uuid = uuidV4();

  return `
    <div data-hypernova-key="${viewName}" data-hypernova-id="${uuid}"></div>
    <script type="application/json" data-hypernova-key="${viewName}" data-hypernova-id="${uuid}"><!--${encode(data)}--></script>
  `;
}

function fallback(error, jobs) {
  return {
    error,
    results: reduce(jobs, {}, (obj, key) => {
      // eslint-disable-next-line no-param-reassign
      obj[key] = {
        error: null,
        html: renderHTML(key, jobs[key].data),
        job: jobs[key],
      };
      return obj;
    }),
  };
}

function toHTML(views) {
  return reduce(views, '', (res, name) => res + views[name].html, '');
}

class Renderer {
  constructor(options) {
    this.url = options.url;
    this.plugins = options.plugins || [];
    this.config = Object.assign({
      timeout: 1000,
      headers: {
        'Content-Type': 'application/json',
      },
    }, options.config);
  }

  addPlugin(plugin) {
    this.plugins.push(plugin);
  }

  pluginReduce(eventName, f, initial) {
    return this.plugins.reduce((res, plugin) => {
      if (plugin[eventName]) {
        return f(plugin[eventName], res);
      }
      return res;
    }, initial);
  }

  createJobs(jobs) {
    // The initial jobs hash which contains the shape of
    // { [view]: { name: String, data: ReactProps } }
    // it's outside of the main try/catch because if there are any failures
    // we want to reuse the jobs hash to go into failure mode.
    return reduce(jobs, {}, (obj, name) => {
      let data = jobs[name];

      try {
        data = this.pluginReduce(
          'getViewData',
          (plugin, newData) => plugin(name, newData),
          jobs[name],
        );
      } catch (err) {
        // let the plugins know about the error but we intentionally
        // don't fallback to failure mode (client rendering) because we can
        // probably salvage the render using the passed in data.
        this.pluginReduce('onError', plugin => plugin(err));
      }

      // the job shape
      // eslint-disable-next-line no-param-reassign
      obj[name] = { name, data };
      return obj;
    }, {});
  }

  prepareRequest(jobs) {
    return Promise.resolve().then(() => {
      // prepare the request by calling the plugins allowing each plugin to transform
      // the jobs hash
      const jobsHash = this.pluginReduce(
        'prepareRequest',
        (plugin, next) => plugin(next, jobs),
        jobs,
      );

      // should we actually fire off a request?
      const shouldSendRequest = this.pluginReduce('shouldSendRequest', (plugin, next) => (
        next && plugin(jobsHash)
      ), true);

      return {
        shouldSendRequest,
        jobsHash,
      };
    });
  }

  render(data) {
    const jobs = this.createJobs(data);

    return this.prepareRequest(jobs)
      // Query our server and retrieve the jobs data
      .then((item) => {
        if (!item.shouldSendRequest) {
          return fallback(null, item.jobsHash);
        }

        // let everyone know we'll be firing a request
        this.pluginReduce('willSendRequest', plugin => plugin(item.jobsHash));

        // fire the request and then convert the response into a shape of
        // { [string]: { error: Error?, html: string, job: Job } }
        // eslint-disable-next-line arrow-body-style
        return axios.post(this.url, item.jobsHash, this.config).then((res) => {
          const { results } = res.data;

          Object.keys(results).forEach((key) => {
            const body = results[key];

            body.job = item.jobsHash[key];
            body.html = body.error ? renderHTML(key, data[key]) : body.html;
          });

          return res.data;
        });
      })
      // if there is an error retrieving the result set or converting it then lets just fallback
      // to client rendering for all the jobs.
      .catch(err => fallback(err, jobs))
      // Run our afterResponse plugins and send back our response.
      .then((res) => {
        const { results } = res;

        try {
          if (res.error) this.pluginReduce('onError', plugin => plugin(res.error, results));

          values(results).forEach((job) => {
            if (job.error) {
              this.pluginReduce('onError', plugin => plugin(job.error, job));
            }
          });

          const successfulJobs = reduce(res.results, {}, (success, key) => Object.assign(success, {
            [key]: res.results[key].job,
          }));

          this.pluginReduce('onSuccess', plugin => plugin(successfulJobs));

          // if there are any plugins, run them
          // otherwise toHTML the response and send that
          return this.plugins.length
            ? this.pluginReduce('afterResponse', (plugin, next) => plugin(next, results), results)
            : toHTML(results);
        } catch (err) {
          this.pluginReduce('onError', plugin => plugin(err, results));
          return toHTML(results);
        }
      });
  }
}

module.exports = Renderer;
