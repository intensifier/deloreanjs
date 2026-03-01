import StoreFacade from '../containers/StoreFacade';

const runtimeMock = () => ({
  initializeExecution: jest.fn(() => ({
    dependencies: [{ name: 'courseName', type: 'normal' }],
    snapshots: [{ timePointId: 'T1', timeLineId: 0, timePointTimestamp: 1 }],
    timing: { lastExecutionMs: 3 },
    status: 'running',
  })),
  resumeFromTimepoint: jest.fn(() => ({
    dependencies: [{ name: 'courseName', type: 'normal' }],
    snapshots: [{ timePointId: 'T1', timeLineId: 0, timePointTimestamp: 1 }],
    timing: { lastExecutionMs: 2 },
    status: 'paused',
  })),
  stopExecution: jest.fn(() => ({
    dependencies: [],
    snapshots: [],
    timing: { lastExecutionMs: 0 },
    status: 'idle',
  })),
});

const createStore = () => {
  return new StoreFacade({
    createTabRef: () => ({ current: null }),
    renderEditor: () => null,
  });
};

describe('execution smoke flow', () => {
  beforeEach(() => {
    global.heap = {
      dependencies: [],
      snapshots: [],
    };
    global.dependencies = [];
    global.timeLine = 0;
    global.startFrom = '';
  });

  test('run -> resume -> stop keeps lifecycle consistent', () => {
    const store = createStore();
    const runtimeService = runtimeMock();

    store.selectTab('test1.js');

    store.runCurrentTab(runtimeService);
    expect(runtimeService.initializeExecution).toHaveBeenCalledTimes(1);
    expect(store.state.isRunning).toBe(true);
    expect(store.state.snapshots).toHaveLength(1);

    store.selectCurrentTimepoint(store.state.snapshots[0]);
    store.resumeSelectedTimepoint(runtimeService);
    expect(runtimeService.resumeFromTimepoint).toHaveBeenCalledWith({ timepointId: 'T1' });

    store.stopExecutionState(runtimeService);
    expect(runtimeService.stopExecution).toHaveBeenCalledTimes(1);
    expect(store.state.isRunning).toBe(false);
    expect(store.state.snapshots).toEqual([]);
  });

  test('resume without selected timepoint is a no-op', () => {
    const store = createStore();
    const runtimeService = runtimeMock();

    const result = store.resumeSelectedTimepoint(runtimeService);

    expect(result).toBeNull();
    expect(runtimeService.resumeFromTimepoint).not.toHaveBeenCalled();
  });
});
