import React, { useEffect, useCallback } from 'react';

import Timepoints from '../Timepoints';
import './styles.css';

export default function Timeline(props) {
  const { appStore } = props;
  const { state, selectCurrentTimepoint } = appStore;
  const { snapshots, selectedTimePoint } = state;

  const renderTimepoint = useCallback(
    (snapshot) => {
      const { timePointId } = snapshot;
      return (
        <div key={timePointId}>
          <div>
            <div
              onClick={() => selectCurrentTimepoint(snapshot)}
              className={`timeline-timepoint ${
                selectedTimePoint === timePointId && 'timeline-selected-timepoint'
              }`}>
              <span className="material-icons">room</span>
            </div>
            <div className="timeline-details-container">
              <span className="timeline-detail-title">{timePointId}</span>
            </div>
          </div>
          <div className="timeline-line" />
        </div>
      );
    },
    [selectedTimePoint],
  );

  return (
    <>
      <Timepoints appStore={appStore} />
      <div className="timeline-timeline-container">
        {snapshots.length ? (
          <>
            <div className="timeline-start-container">
              <span>Start</span>
            </div>
            <div className="timeline-line" />
            {snapshots.map(renderTimepoint)}
            <div className="timeline-start-container timeline-end-container">
              <span>End</span>
            </div>
          </>
        ) : (
          <span>Run the code to start tracking timepoints</span>
        )}
      </div>
    </>
  );
}
