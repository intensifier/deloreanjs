describe('runtime-service', () => {
  let runtimeService;
  let debuggerMock;

  beforeEach(() => {
    jest.resetModules();

    global.heap = {
      dependencies: [],
      snapshots: [],
    };
    global.timeLine = 9;
    global.startFrom = 'T9';
    global.implicitTimepoints = false;

    debuggerMock = {
      init: jest.fn(() => {
        global.heap = {
          dependencies: [{ name: 'score', type: 'normal' }],
          snapshots: [{ timePointId: 'T1', timeLineId: 0 }],
        };
      }),
      invokeContinuation: jest.fn(() => {
        global.heap.snapshots = [
          ...global.heap.snapshots,
          { timePointId: 'T2', timeLineId: 1 },
        ];
      }),
      getEndTimes: jest.fn(() => 17),
    };

    jest.doMock('../debugger', () => debuggerMock);
    runtimeService = require('../runtime-service');
  });

  afterEach(() => {
    jest.dontMock('../debugger');
  });

  test('initializeExecution populates normalized snapshot', () => {
    const snapshot = runtimeService.initializeExecution({
      code: 'const x = 1;',
      implicitTimepoints: 'Implicit',
    });

    expect(debuggerMock.init).toHaveBeenCalledWith('const x = 1;');
    expect(global.implicitTimepoints).toBe(true);
    expect(snapshot.dependencies).toEqual([{ name: 'score', type: 'normal' }]);
    expect(snapshot.snapshots).toEqual([{ timePointId: 'T1', timeLineId: 0 }]);
    expect(snapshot.status).toBe(runtimeService.STATUS.RUNNING);
    expect(snapshot.timing.lastExecutionMs).toBe(17);
    expect(runtimeService.getEndTimes()).toBe(17);
  });

  test('resumeFromTimepoint updates timeline and status', () => {
    runtimeService.initializeExecution({ code: 'const x = 1;' });

    const snapshot = runtimeService.resumeFromTimepoint({ timepointId: 'T1' });

    expect(debuggerMock.invokeContinuation).toHaveBeenCalledWith('T1');
    expect(snapshot.snapshots).toHaveLength(2);
    expect(snapshot.status).toBe(runtimeService.STATUS.PAUSED);
  });

  test('stopExecution resets global continuation cursor', () => {
    runtimeService.initializeExecution({ code: 'const x = 1;' });

    const snapshot = runtimeService.stopExecution();

    expect(global.timeLine).toBe(0);
    expect(global.startFrom).toBe('');
    expect(snapshot.status).toBe(runtimeService.STATUS.IDLE);
  });
});
