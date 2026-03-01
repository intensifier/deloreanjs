import React from 'react';

export default function Line(props) {
  const { start, end, type, selectedTimepointLine, timelineIdx = 0 } = props;

  const toFiniteNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const getLineStartOffset = (value, isMainTimeline) => {
    const numericValue = toFiniteNumber(value, 0);
    if (isMainTimeline) {
      return numericValue > 1 ? numericValue * 5 + 2 : numericValue;
    }

    return numericValue * 5 + 2;
  };

  if (type === 'horizontal') {
    const marginLeft = getLineStartOffset(start, timelineIdx === 0);
    return (
      <div
        style={{
          marginLeft: `${marginLeft}em`,
          width: `${end * 5}em`,
          height: '0.5em',
          zIndex: '-1',
          position: 'absolute',
          top: '0.8em',
          left: '0.5em',
          backgroundColor: '#6cd0e5',
        }}></div>
    );
  } else if (type === 'vertial') {
    let end = selectedTimepointLine;
    const marginLeft = getLineStartOffset(start, false);
    return (
      <div
        style={{
          marginLeft: `${marginLeft}em`,
          width: '0.5em',
          height: `${end * 7}em`,
          zIndex: '-1',
          position: 'absolute',
          top: `-${end * 7}em`,
          left: '0.25em',
          backgroundColor: '#6cd0e5',
        }}></div>
    );
  }
}
