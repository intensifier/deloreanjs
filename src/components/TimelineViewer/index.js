import React, { useEffect, useCallback, useRef, useState } from 'react';
import cloneDeep from 'lodash.clonedeep';
import SimpleBar from 'simplebar-react';
import TimepointList from '../TimepointList';
import Timepoint from './Timepoint';
import Timestamps from './Timestamps';
import Element from './Element';
import Line from './Line';
import './styles.css';

const toFiniteNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toNonNegativeInteger = (value, fallback = 0) => {
  const parsed = Math.floor(toFiniteNumber(value, fallback));
  return parsed >= 0 ? parsed : fallback;
};

export default function Timeline(props) {
  const { store, getEndTimes } = props;
  const { state, getTimepointById, selectCurrentTimepoint } = store;
  const {
    snapshots,
    selectedTimePoint,
    selectedTimePointLine,
    timelineRevision = 0,
    executionStatus,
  } = state;
  const [timelineList, setTimelineList] = useState([]);
  const [endTimesList, setEndTimesList] = useState([]);
  const [lastMsList, setLastMsList] = useState([0]);
  const [lineBreaks, setLineBreaks] = useState([0]);
  const previousSnapshotsSignatureRef = useRef('');
  const previousTimelineRevisionRef = useRef(0);
  const snapshotsSignature = snapshots
    .map(({ timePointId, timeLineId, timePointTimestamp }) => {
      return `${timePointId}|${timeLineId}|${timePointTimestamp}`;
    })
    .join('::');

  useEffect(() => {
    const signatureChanged = previousSnapshotsSignatureRef.current !== snapshotsSignature;
    const revisionChanged = previousTimelineRevisionRef.current !== timelineRevision;
    previousSnapshotsSignatureRef.current = snapshotsSignature;
    previousTimelineRevisionRef.current = timelineRevision;

    if (!Boolean(snapshots.length)) {
      setTimelineList([]);
      setEndTimesList([]);
      setLastMsList([0]);
      setLineBreaks([0]);
      return;
    }

    if (!signatureChanged && !revisionChanged) {
      return;
    }

    if (Boolean(snapshots.length)) {
      const timeline = cloneDeep(snapshots);
      setTimelineList((timelineList) => [...timelineList, timeline]);

      let endTime = toFiniteNumber(getEndTimes(), 0) + 1;
      const timepoint = selectedTimePoint ? getTimepointById(selectedTimePoint) : null;
      if (timepoint) {
        const timepointTimestamp = toFiniteNumber(timepoint.timePointTimestamp, 0);
        const selectedLine = toFiniteNumber(selectedTimePointLine, 0);
        const timepointLine = toFiniteNumber(timepoint.timeLineId, 0);
        endTime += timepointTimestamp;
        /* calcula el salto de linea que debe hacer hacia abajo (vertical line) */
        // console.log({ actualLine: timepoint.timeLineId, lineOfTimepoint: selectedTimePointLine });
        const lastMs = toNonNegativeInteger(timepointTimestamp, 0);
        const lineBreak = Math.max(1, toNonNegativeInteger(timepointLine - selectedLine, 0));

        setLastMsList((lastMsList) => [...lastMsList, lastMs]);
        setLineBreaks((lineBreaks) => [...lineBreaks, lineBreak]);
      }

      setEndTimesList((endTimesList) => [...endTimesList, toNonNegativeInteger(endTime, 1)]);
    }
  }, [
    getEndTimes,
    getTimepointById,
    selectedTimePoint,
    selectedTimePointLine,
    snapshots,
    snapshotsSignature,
    timelineRevision,
  ]);

  const renderTimeline = useCallback(
    (snapshots, timelineIdx) => {
      let enable = false;
      const endTime = toNonNegativeInteger(endTimesList[timelineIdx], 0);
      const lastMs = toNonNegativeInteger(lastMsList[timelineIdx], 0);
      const maxEndTime = Math.max(0, ...endTimesList.map((value) => toNonNegativeInteger(value, 0)));
      const timelineLength = maxEndTime + 20;

      function isEnable(timepoints, timelineIdx) {
        let idPoint = timepoints[0].timePointId;
        let linePoint = timepoints[0].timeLineId;

        if (timelineIdx === linePoint && timelineIdx === 0) return true;
        if (timelineIdx !== linePoint) return false;

        if (timelineIdx === linePoint) {
          timelineList.forEach((snapshots, index) => {
            let samePoint = snapshots.filter((el) => el.timePointId === idPoint);

            // console.log({
            //   timelineIdx,
            //   linePoint,
            //   idPoint,
            //   index,
            //   enable: Boolean(linePoint === index),
            // });

            if (samePoint[0] && samePoint[0].timeLineId === index) {
              enable = true;
            }
          });
        }
        return enable;
      }

      const isLatestTimeline = timelineIdx === timelineList.length - 1;
      const endClassNames = [
        'timeline-start-container',
        'timeline-end-container',
        isLatestTimeline && executionStatus === 'error' && 'timeline-end-container-error',
      ]
        .filter(Boolean)
        .join(' ');

      return (
        <section key={timelineIdx} className="timeline-container">
          {timelineIdx === 0 && <Element title="Start" classNames="timeline-start-container" />}

          {Array.from({ length: timelineLength }).map((_, index) => {
            if (index === 0 && timelineIdx === 0) return null;

            let timepoints = snapshots.filter((snapshot) => snapshot.timePointTimestamp === index);

            if (index < lastMs) return <div key={index} className="timeline-empty-space"></div>;

            if (timepoints.length > 0) {
              let isSelected = timepoints.map((el) => el.timePointId === selectedTimePoint);
              return (
                <Timepoint
                  isSelected={isSelected.includes(true)}
                  selectedTimepoint={selectedTimePoint}
                  key={index}
                  selectCurrentTimepoint={selectCurrentTimepoint}
                  timepoints={timepoints}
                  timelineIdx={timelineIdx}
                  timelineList={timelineList}
                  enable={isEnable(timepoints, timelineIdx)}
                />
              );
            } else if (endTime === index) {
              return (
                <Element
                  key={index}
                  title="End"
                  classNames={endClassNames}
                />
              );
            } else {
              return <div key={index} className="timeline-empty-space"></div>;
            }
          })}

          <Line
            type="horizontal"
            start={timelineIdx === 0 ? 1 : lastMs}
            end={Math.max(0, endTime - (timelineIdx === 0 ? 0 : lastMs))}
            timelineIdx={timelineIdx}
          />
          {timelineIdx !== 0 && (
            <Line
              type="vertial"
              start={timelineIdx === 0 ? 1 : lastMs}
              timelineIdx={timelineIdx}
              selectedTimepointLine={lineBreaks[timelineIdx]}
            />
          )}
        </section>
      );
    },
    [
      endTimesList,
      lastMsList,
      lineBreaks,
      selectCurrentTimepoint,
      selectedTimePoint,
      timelineList,
      executionStatus,
    ],
  );

  return (
    <section className="timeline-viewer-container">
      <TimepointList store={store} />
      <div className="timeline-viewer">
        {(() => {
          const maxEndTime = Math.max(0, ...endTimesList.map((value) => toNonNegativeInteger(value, 0)));
          const timestampsEndTime = maxEndTime + 20;

          return Boolean(timelineList.length) ? (
            <div className="timeline-list-container">
              <SimpleBar style={{ height: '100%' }}>
                <Timestamps endTime={timestampsEndTime} />
                {timelineList.map(renderTimeline)}
              </SimpleBar>
            </div>
          ) : (
            <div className="timeline-viewer-without-timelines">
              <span>Run the code to start tracking timepoints</span>
            </div>
          );
        })()}
      </div>
    </section>
  );
}
