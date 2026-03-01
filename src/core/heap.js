/* eslint-disable no-undef, eqeqeq, no-loop-func, array-callback-return, no-eval, no-unused-vars */
global.heap = {};
global.dependencies = [];
heap.snapshots = [];
global.tempValueStore = {};

module.exports = {
  addDependencies: (dependencies) => {
    heap.dependencies = dependencies;
  },

  heapSnapshot: (id, loc) => {
    let timestamp = Date.now() - startTime + acumTime;

    const snapshot = {
      timeLineId: global.timeLine,
      timePointId: '',
      timePointTimestamp: timestamp,
      timePointLoc: loc,
    };

    let originId = id;
    let counter = 0;
    let startFrom = typeof global.startFrom === 'string' ? global.startFrom : '';
    let startFromNumber = startFrom;
    let i = 0;

    while (isNaN(parseInt(startFromNumber))) {
      startFromNumber = startFrom.slice(i);
      if (i > startFrom.length) break;
      ++i;
    }
    if (i <= startFrom.length) {
      let startFromName = startFrom.slice(0, i - 1);
      if (id == startFromName) {
        counter = parseInt(startFromNumber);
        id = id + ++counter;
      }
    }

    let oldTimePoint;
    while (heap.snapshots.find((element) => element.timePointId == id)) {
      oldTimePoint = heap.snapshots.findIndex(
        (element) => element.timePointId == id && element.timeLineId != global.timeLine,
      );
      if (oldTimePoint != -1) heap.snapshots.splice(oldTimePoint, 1);
      else id = originId + ++counter;
    }

    snapshot.timePointId = id;
    heap.dependencies.map((dependecy) => {
      try {
        snapshot[`${dependecy.name}`] = tempValueStore[`${dependecy.name}`];
      } catch (e) {}
    });
    heap.snapshots.push(snapshot);
  },
};
