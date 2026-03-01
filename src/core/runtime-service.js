/* eslint-disable no-undef, eqeqeq, no-loop-func, array-callback-return, no-eval, no-unused-vars */
const debuggerDelorean = require('./debugger');

const STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  ERROR: 'error',
};

class RuntimeService {
  constructor() {
    this.status = STATUS.IDLE;
    this.lastExecutionMs = 0;
    this.lastError = null;
  }

  normalizeImplicitMode = (implicitTimepoints) => {
    if (typeof implicitTimepoints === 'boolean') return implicitTimepoints;
    return implicitTimepoints === 'Implicit';
  };

  getExecutionSnapshot = () => {
    const heap = global.heap || {};
    const dependencies = Array.isArray(heap.dependencies) ? heap.dependencies : [];
    const snapshots = Array.isArray(heap.snapshots) ? heap.snapshots : [];
    return {
      dependencies,
      snapshots,
      timing: {
        lastExecutionMs: this.lastExecutionMs,
      },
      status: this.status,
      error: this.lastError,
    };
  };

  getEndTimes = () => {
    return this.lastExecutionMs;
  };

  initializeExecution = ({ code, implicitTimepoints = false }) => {
    global.implicitTimepoints = this.normalizeImplicitMode(implicitTimepoints);
    this.lastError = null;
    try {
      debuggerDelorean.init(code);
      const lastExecutionMs = debuggerDelorean.getEndTimes();
      this.lastExecutionMs = Number.isFinite(lastExecutionMs) ? lastExecutionMs : 0;
      this.lastError = global.__deloreanLastError || null;
      this.status = this.lastError ? STATUS.ERROR : STATUS.RUNNING;
    } catch (error) {
      this.status = STATUS.ERROR;
      this.lastError = error;
      throw error;
    }

    return this.getExecutionSnapshot();
  };

  resumeFromTimepoint = ({ timepointId }) => {
    if (!timepointId) {
      return this.getExecutionSnapshot();
    }

    this.lastError = null;
    try {
      debuggerDelorean.invokeContinuation(timepointId);
      const lastExecutionMs = debuggerDelorean.getEndTimes();
      this.lastExecutionMs = Number.isFinite(lastExecutionMs) ? lastExecutionMs : 0;
      this.lastError = global.__deloreanLastError || null;
      this.status = this.lastError ? STATUS.ERROR : STATUS.PAUSED;
    } catch (error) {
      this.status = STATUS.ERROR;
      this.lastError = error;
      throw error;
    }

    return this.getExecutionSnapshot();
  };

  stopExecution = () => {
    global.timeLine = 0;
    global.startFrom = '';
    this.status = STATUS.IDLE;
    this.lastError = null;

    return this.getExecutionSnapshot();
  };
}

module.exports = new RuntimeService();
module.exports.STATUS = STATUS;
