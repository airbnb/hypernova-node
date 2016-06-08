'use strict';

function runAssertions(done, assertions, html) {
  // on next tick call done so that onError runs
  process.nextTick(() => {
    let err = null;
    try {
      assertions(html);
    } catch (error) {
      err = error;
    }

    done(err);
  });
}

module.exports = runAssertions;
