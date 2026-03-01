/* eslint-disable no-undef, eqeqeq, no-loop-func, array-callback-return, no-eval, no-unused-vars */
const { prepareCode } = require('./static-analysis');
/* necessary for eval(code) */
const { vm } = require('unwinder-engine');
const cloneDeep = require('lodash.clonedeep');

function ldDeepCopy(original) {
  return cloneDeep(original);
}
/* necessary for eval(code) */

global.timeLine = 0;
global.startFrom = '';
global.fromTheFuture = false;
global.implicitCounter = undefined;
global.startTime = undefined;
global.initTime = undefined;
global.endTime = undefined;
global.acumTime = undefined;
global.implicitTimepoints = false;
global.__deloreanLastError = null;

function showTime() {
  console.log({
    initTime: global.initTime,
    startTime: global.startTime,
    endTime: global.endTime,
    acumTime: global.acumTime,
    'startTime-endTime': global.endTime - global.startTime,
  });
}

module.exports = {
  init: (input) => {
    global.implicitCounter = 0;
    global.__deloreanLastError = null;

    let code = prepareCode(input);

    try {
      console.log(`%cStart first execution`, 'background: #222; color: cyan');
      global.acumTime = 0;
      global.startTime = Date.now();
      eval(code);
      global.endTime = Date.now();
      console.log(`%cFinish first execution`, 'background: #222; color: cyan');
    } catch (e) {
      global.__deloreanLastError = e;
      console.error(e, 'Error from VM');
    }
  },
  invokeContinuation: (kont) => {
    global.fromTheFuture = true;
    global.__deloreanLastError = null;
    try {
      global.startFrom = kont;
      global.heap.snapshots.find(
        (element) => element.timePointId == kont,
      ).timeLineId = ++global.timeLine;
      global.acumTime = global.heap.snapshots.find(
        (element) => element.timePointId == kont,
      ).timePointTimestamp;

      console.log(`%cStart TimePoint ${kont}`, 'background: #222; color: #bada55');
      global.startTime = Date.now();
      eval(
        `let kontAux = continuations.kont${kont}; 
        contTimeLine.kont${kont} = global.timeLine;       
        continuations.kont${kont}(); 
        continuations.kont${kont} = kontAux`,
      );
      global.endTime = Date.now();
      console.log(`%cEnd TimePoint ${kont}`, 'background: #222; color: #bada55');
    } catch (e) {
      global.__deloreanLastError = e;
      console.error(e, 'Error from VM');
    }
  },
  getEndTimes: () => global.endTime - global.startTime,
};
