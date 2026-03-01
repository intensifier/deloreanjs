import React from 'react';
import { Container } from 'unstated';
import { DependencyItem } from '../components';

const initialTimelineState = {
  dependencies: [],
  snapshots: [],
  selectedTimePoint: '',
  selectedTimePointLine: '',
  timePointValues: {},
  displayedObjects: [],
  displayedObjectsNames: [],
  displayedObjectsDOM: [],
};

export default class TimelineContainer extends Container {
  constructor() {
    super();
    this.state = {
      ...initialTimelineState,
    };
  }

  clear = () => {
    this.state = {
      ...this.state,
      ...initialTimelineState,
    };
  };

  updateSnapshots = (snapshots) => {
    this.state = {
      ...this.state,
      snapshots,
    };
  };

  updateDependencies = (dependencies) => {
    this.state = {
      ...this.state,
      dependencies,
    };
  };

  getTimepointById = (name) => {
    return this.state.snapshots.find((timepoint) => timepoint.timePointId === name);
  };

  setSelectedTimepoint = (timepoint) => {
    this.state = {
      ...this.state,
      selectedTimePoint: timepoint.timePointId,
      selectedTimePointLine: timepoint.timeLineId,
      timePointValues: timepoint,
    };
  };

  refreshFromRuntime = ({ dependencies, snapshots } = {}) => {
    if (dependencies) {
      this.updateDependencies(dependencies);
    }

    if (snapshots) {
      this.updateSnapshots(snapshots);
    }
  };

  toggleObject = (object, name) => {
    let index = this.state.displayedObjectsNames.indexOf(name);

    if (index < 0) {
      let displayedObjects = [...this.state.displayedObjects, object];
      let displayedObjectsNames = [...this.state.displayedObjectsNames, name];
      let displayedObjectsDOM = [...this.state.displayedObjectsDOM, []];

      for (let value in object) {
        const element = displayedObjects[displayedObjects.length - 1][value];

        displayedObjectsDOM[displayedObjects.length - 1].push(
          <DependencyItem
            key={name + '-' + value}
            element={element}
            name={name + '-' + value}
            type={typeof element}
            toggleObject={this.toggleObject}
            displayedObjectsNames={displayedObjectsNames}
            displayedObjectsDOM={displayedObjectsDOM}
            input={name + '-' + value}
          />,
        );
      }

      this.state = {
        ...this.state,
        displayedObjects,
        displayedObjectsNames,
        displayedObjectsDOM,
      };

      return;
    }

    this.state = {
      ...this.state,
      displayedObjects: this.state.displayedObjects.filter((_, currentIndex) => currentIndex !== index),
      displayedObjectsNames: this.state.displayedObjectsNames.filter(
        (_, currentIndex) => currentIndex !== index,
      ),
      displayedObjectsDOM: this.state.displayedObjectsDOM.filter(
        (_, currentIndex) => currentIndex !== index,
      ),
    };
  };
}
