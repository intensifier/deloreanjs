import React from 'react';
import { Container } from 'unstated';
import EditorContainer from './EditorContainer';
import ExecutionContainer from './ExecutionContainer';
import TimelineContainer from './TimelineContainer';
import WatchContainer from './WatchContainer';

export default class StoreFacade extends Container {
  constructor({ createTabRef, renderEditor } = {}) {
    super();
    const createRefFactory = createTabRef || (() => ({ current: null }));

    this.editorContainer = new EditorContainer({ createTabRef: createRefFactory });
    this.executionContainer = new ExecutionContainer();
    this.timelineContainer = new TimelineContainer();
    this.watchContainer = new WatchContainer();
    this.renderEditor = renderEditor || (() => null);

    const [selectedTab] = this.editorContainer.getSelectedTab();
    if (selectedTab && Array.isArray(selectedTab.watchVariables)) {
      this.watchContainer.resetWatchVariables(selectedTab.watchVariables);
    }

    this.editor = {
      selectTab: this.selectTab,
      updateActiveCode: this.updateTabCode,
      saveActiveTab: this.saveCode,
      newTab: this.newTab,
      removeTab: this.removeTab,
    };

    this.execution = {
      runCurrentTab: this.runCurrentTab,
      stop: this.stopExecutionState,
      resumeSelectedTimepoint: this.resumeSelectedTimepoint,
    };

    this.timeline = {
      setSelectedTimepoint: this.setSelectedTimepoint,
      refreshFromRuntime: this.refreshFromRuntime,
    };

    this.watch = {
      addVariable: this.addVariableValue,
      removeVariable: this.deleteWatchVariable,
      setVariables: this.resetWatchVariables,
    };

    this.state = this.collectState();
  }

  collectState = () => {
    return {
      ...this.editorContainer.state,
      ...this.watchContainer.state,
      ...this.timelineContainer.state,
      ...this.executionContainer.state,
    };
  };

  syncState = (callback) => {
    const nextState = this.collectState();
    this.state = nextState;
    this.setState(nextState, callback);
  };

  getTimepointById = (name) => {
    return this.timelineContainer.getTimepointById(name);
  };

  getSelectedTab = () => {
    return this.editorContainer.getSelectedTab();
  };

  saveCode = () => {
    this.editorContainer.saveCode();
    this.syncState();
  };

  getEditor = (code, ref) => {
    return this.renderEditor(code, ref, this.updateTabCode);
  };

  updateTabCode = (instance) => {
    const code = instance.getValue();
    this.editorContainer.updateTabCode(code);
    this.syncState();
  };

  getSelectedEditor = () => {
    const { tabs } = this.editorContainer.state;
    const selectedTab = tabs.find((tab) => tab.selected === true);
    if (selectedTab) return this.getEditor(selectedTab.code, selectedTab.ref);
    return this.setDefaultTab();
  };

  setDefaultTab = () => {
    const { tabs } = this.editorContainer.state;
    if (tabs.length === 0) {
      return (
        <div style={{ display: 'grid', placeContent: 'center', height: '100%' }}>
          <span>Create a file</span>
        </div>
      );
    }

    this.selectTab(tabs[0].name);
    return null;
  };

  selectTab = (name) => {
    const selection = this.editorContainer.selectTab(name, {
      isRunning: this.executionContainer.state.isRunning,
    });

    if (!selection || selection.blocked || selection.unchanged) return;

    this.clean(selection.watchVariables || []);
    this.syncState(() => {
      this.stilizeSelectedTab(selection.newSelectedTabIndex, selection.oldSelectedTabIndex);
    });
  };

  stilizeSelectedTab = (newSelectedTabIndex, oldSelectedTabIndex = -1) => {
    const tabElements = [...document.getElementsByClassName('tab-container')];
    if (!tabElements.length) return;

    if (oldSelectedTabIndex >= 0 && tabElements[oldSelectedTabIndex]) {
      tabElements[oldSelectedTabIndex].classList.remove('tab-selected');
    }

    if (tabElements[newSelectedTabIndex]) {
      tabElements[newSelectedTabIndex].classList.add('tab-selected');
    }
  };

  removeTab = (name) => {
    this.editorContainer.removeTab(name);
    this.syncState();
  };

  newTab = () => {
    this.editorContainer.newTab();
    this.syncState();
  };

  saveTabName = (name) => {
    const filename = this.editorContainer.saveTabName(name);
    this.syncState(() => this.selectTab(filename));
  };

  updateTabs = (tabs, callback) => {
    this.editorContainer.updateTabs(tabs);
    this.syncState(callback);
  };

  clean = (watchVariables = []) => {
    global.heap = {
      dependencies: [],
      snapshots: [],
    };

    global.continuations = {};
    global.snapshotCounter = 0;

    this.watchContainer.resetWatchVariables(watchVariables);
    this.timelineContainer.clear();
    this.syncState();
  };

  updateSnapshots = (snapshots) => {
    this.timelineContainer.updateSnapshots(snapshots);
    this.syncState();
  };

  updateDependencies = (dependencies) => {
    this.timelineContainer.updateDependencies(dependencies);
    this.syncState();
  };

  selectCurrentTimepoint = (timepoint) => {
    this.timelineContainer.setSelectedTimepoint(timepoint);
    this.syncState();
  };

  setSelectedTimepoint = (timepoint) => {
    this.selectCurrentTimepoint(timepoint);
  };

  toggleObject = (ev, object, name) => {
    this.timelineContainer.toggleObject(object, name);
    this.syncState();
  };

  deleteWatchVariable = (variable) => {
    this.watchContainer.removeVariable(variable);
    this.syncState();
  };

  resetWatchVariables = (variables) => {
    this.watchContainer.resetWatchVariables(variables);
    this.syncState();
  };

  toggleCopy = (mode) => {
    this.executionContainer.toggleCopy(mode);
    this.syncState();
  };

  toggleImplicit = (mode) => {
    this.executionContainer.toggleImplicit(mode);
    this.syncState();
  };

  addVariable = () => {
    const newWatchVariable = document.getElementById('watch-variable-input');
    if (!newWatchVariable) return;

    this.watchContainer.addVariable(newWatchVariable.value);
    newWatchVariable.value = '';
    this.syncState();
  };

  addVariableValue = (value) => {
    this.watchContainer.addVariable(value);
    this.syncState();
  };

  toggleIsRunning = () => {
    this.executionContainer.toggleIsRunning();
    this.syncState();
  };

  setIsRunning = (isRunning) => {
    this.executionContainer.setIsRunning(isRunning);
    this.syncState();
  };

  setExecutionStatus = (status, lastExecutionMs, timelineRevision) => {
    this.executionContainer.setExecutionStatus(status, lastExecutionMs, timelineRevision);
    this.syncState();
  };

  refreshFromRuntime = (snapshot, { sync = true } = {}) => {
    this.timelineContainer.refreshFromRuntime(snapshot);

    if (snapshot && snapshot.status) {
      const lastExecutionMs = snapshot.timing ? snapshot.timing.lastExecutionMs : undefined;
      const timelineRevision = this.executionContainer.state.timelineRevision;
      this.executionContainer.setExecutionStatus(snapshot.status, lastExecutionMs, timelineRevision);
    }

    if (sync) {
      this.syncState();
    }
  };

  runCurrentTab = (runtimeService) => {
    const [tab] = this.getSelectedTab();
    if (!tab) return null;

    this.executionContainer.bumpTimelineRevision();
    const snapshot = runtimeService.initializeExecution({
      code: tab.savedCode,
      implicitTimepoints: this.executionContainer.state.implicitTimepoints,
    });

    this.refreshFromRuntime(snapshot);
    this.executionContainer.setIsRunning(true);
    this.syncState();

    return snapshot;
  };

  stopExecutionState = (runtimeService) => {
    const snapshot = runtimeService.stopExecution();
    this.executionContainer.setIsRunning(false);
    this.refreshFromRuntime(snapshot);
    this.clean(this.watchContainer.state.watchVariables);

    return snapshot;
  };

  resumeSelectedTimepoint = (runtimeService) => {
    const selectedTimepoint = this.timelineContainer.state.selectedTimePoint;
    if (!selectedTimepoint) {
      return null;
    }

    this.executionContainer.bumpTimelineRevision();
    const snapshot = runtimeService.resumeFromTimepoint({ timepointId: selectedTimepoint });
    this.refreshFromRuntime(snapshot);

    return snapshot;
  };
}
