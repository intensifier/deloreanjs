/* eslint-disable no-undef, eqeqeq, no-loop-func, array-callback-return, no-eval, no-unused-vars */
const { heapSnapshot } = require('./heap');

global.breakpoint = {
  name: '',
  activate: false,
};

module.exports = {
  insertTimepoint: (id, loc = null) => {
    heapSnapshot(id, loc);
  },

  watch: (array) => {
    console.log('Debugging [' + array + ']');
  },

  insertBreakpoint: (id, loc = null) => {
    heapSnapshot(id, loc);
    global.breakpoint = {
      id,
      activate: true,
    };
  },
};
