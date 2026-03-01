import { Container } from 'unstated';

export default class ExecutionContainer extends Container {
  constructor() {
    super();
    this.state = {
      isRunning: false,
      readOnly: false,
      copyStyle: 'Shallow Copy',
      implicitTimepoints: 'Explicit',
      executionStatus: 'idle',
      lastExecutionMs: 0,
      timelineRevision: 0,
    };
  }

  setExecutionStatus = (
    status,
    lastExecutionMs = this.state.lastExecutionMs,
    timelineRevision = this.state.timelineRevision,
  ) => {
    this.state = {
      ...this.state,
      executionStatus: status,
      lastExecutionMs,
      timelineRevision,
    };
  };

  bumpTimelineRevision = () => {
    this.state = {
      ...this.state,
      timelineRevision: this.state.timelineRevision + 1,
    };
  };

  toggleIsRunning = () => {
    this.state = {
      ...this.state,
      isRunning: !this.state.isRunning,
      readOnly: !this.state.readOnly,
    };
  };

  setIsRunning = (isRunning) => {
    this.state = {
      ...this.state,
      isRunning,
      readOnly: isRunning,
    };
  };

  toggleCopy = (mode) => {
    if (!this.state.isRunning) {
      if (mode === this.state.copyStyle) {
        return;
      }

      this.state = {
        ...this.state,
        copyStyle: mode,
      };

      return;
    }

    alert('Sorry, you need stop this execution before change the copy mode! :)');
  };

  toggleImplicit = (mode) => {
    if (!this.state.isRunning) {
      if (mode === this.state.implicitTimepoints) {
        return;
      }

      this.state = {
        ...this.state,
        implicitTimepoints: mode,
      };

      global.implicitTimepoints = !global.implicitTimepoints;
      return;
    }

    alert('Sorry, you need stop this execution before change the timepoint mode! :)');
  };
}
