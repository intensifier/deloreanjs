import React, { Component, createRef } from 'react';
import { Layout, Console, TimelineViewer, Header, EditorBar, Sidebar, FAB } from './components';
import SimpleBar from 'simplebar-react';
import './App.css';

import intro from './introduction';
import { attachKeyboardShortcuts } from './utils/keyboardShortcuts';

global.delorean = require('./core/delorean.js');
const runtimeService = require('./core/runtime-service');

class App extends Component {
  constructor(props) {
    super(props);
    this.consoleFeed = createRef();
    this.detachKeyboardShortcuts = null;
  }

  componentDidMount() {
    this.detachKeyboardShortcuts = attachKeyboardShortcuts({
      onEnterWatchVariable: () => this.props.store.addVariable(),
      onSaveCode: () => this.props.store.saveCode(),
    });
  }

  componentWillUnmount() {
    if (this.detachKeyboardShortcuts) {
      this.detachKeyboardShortcuts();
    }
  }

  clearConsole = () => {
    if (this.consoleFeed.current && this.consoleFeed.current.state) {
      this.consoleFeed.current.state.logs = [];
    }
  };

  executeCode = () => {
    const { store } = this.props;

    try {
      this.clearConsole();
      store.execution.runCurrentTab(runtimeService);
    } catch (error) {
      console.error(error);
    }
  };

  stopExecution = () => {
    const { store } = this.props;
    this.clearConsole();
    store.execution.stop(runtimeService);
  };

  invokeContinuation = () => {
    const { store } = this.props;

    if (store.state.selectedTimePoint) {
      this.clearConsole();
      store.execution.resumeSelectedTimepoint(runtimeService);
    } else {
      alert('Please, select your Timepoint!');
    }
  };

  render() {
    return (
      <Layout>
        <div className="main-page-container">
          <Header intro={intro} />
          <div className="playground-container">
            <Sidebar appStore={this.props.store} />
            <div className="playground-content-container">
              <div className="top-panel">
                <div className="codemirror-container">
                  <div className="editor-bar-container-fixed">
                    <SimpleBar>
                      <EditorBar
                        appStore={this.props.store}
                        executeCode={this.executeCode}
                        stopExecution={this.stopExecution}
                      />
                    </SimpleBar>
                  </div>
                  <SimpleBar style={{ maxHeight: '40vh' }}>{this.props.store.getSelectedEditor()}</SimpleBar>
                </div>
                <div className="console-container">
                  <Console ref={this.consoleFeed} />
                </div>
              </div>
              <div className="bottom-panel">
                <TimelineViewer store={this.props.store} getEndTimes={runtimeService.getEndTimes} />
              </div>
            </div>
            <FAB
              appStore={this.props.store}
              executeCode={this.executeCode}
              stopExecution={this.stopExecution}
              invokeContinuation={this.invokeContinuation}
            />
          </div>
        </div>
      </Layout>
    );
  }
}

export default App;
