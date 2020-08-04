import React, { Component, createRef } from 'react';
import { Provider, Subscribe } from 'unstated';
import { Layout, Console, Output, Header, EditorBar, Sidebar, FAB } from './components';
import AppContainer from './containers/AppContainer';
import './App.css';

import CodeMirror from '@uiw/react-codemirror';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/keymap/sublime';

import './dracula.css';

global.delorean = require('./core/delorean.js'); // this line allow uses global variables form core/delorean (global.breakpoint -> state.js)
const debuggerDelorean = require('./core/debugger');

class App extends Component {
  constructor(props) {
    super(props);
    this.consoleFeed = createRef();
    this.editor = createRef();
  }

  selectTab = (ev, appStore) => {
    if (!appStore.state.isRunning) {
      let example = appStore.state.tabs.find(
        (o) => o.name === ev.currentTarget.firstChild.getAttribute('name'),
      );
      appStore.updateCode(example.input);
      appStore.selectTabColor(ev);
      appStore.clean(example.watchVariables);
    } else {
      alert('Sorry, you need stop this execution before change the code! :)');
    }
  };

  executeCode = (appStore) => {
    try {
      this.editor.current.editor.setOption('readOnly', true);
      appStore.toggleIsRunning();
      debuggerDelorean.init(appStore.state.code);
      appStore.updateDependencies(global.heap.dependencies);
      appStore.updateSnapshots(global.heap.snapshots);
    } catch (error) {
      console.error(error);
    }
  };

  stopExecution = (appStore) => {
    this.consoleFeed.current.state.logs = [];
    this.editor.current.editor.setOption('readOnly', false);
    appStore.toggleIsRunning();
    appStore.clean(appStore.state.watchVariables);
    global.timeLine = 0;
    global.startFrom = '';
  };

  invokeContinuation = (appStore) => {
    if (appStore.state.selectedTimePoint) {
      this.consoleFeed.current.state.logs = [];
      debuggerDelorean.invokeContinuation(appStore.state.selectedTimePoint);
      appStore.updateSnapshots(global.heap.snapshots);
    } else {
      alert('Please, select your Timepoint!');
    }
  };

  render() {
    var options = {
      theme: 'dracula',
      tabSize: 4,
      keyMap: 'sublime',
      mode: 'js',
      lineNumbers: true,
    };

    return (
      <Layout>
        <Provider>
          <Subscribe to={[AppContainer]}>
            {(appStore) => (
              <div className="main-page-container">
                <Header />
                <div className="playground-container">
                  <Sidebar appStore={appStore} />
                  <div className="playground-content-container">
                    <div className="top-panel">
                      <div className="codemirror-container">
                        <div className="editor-bar-container-fixed">
                          <EditorBar
                            appStore={appStore}
                            selectTab={this.selectTab}
                            executeCode={this.executeCode}
                            stopExecution={this.stopExecution}
                          />
                        </div>
                        <CodeMirror
                          ref={this.editor}
                          value={appStore.state.code}
                          options={options}
                          onChange={appStore.updateCode}
                        />
                      </div>
                      <div className="console-container">
                        <Console ref={this.consoleFeed} />
                      </div>
                    </div>
                    <div className="bottom-panel">
                      <Output appStore={appStore} invokeContinuation={this.invokeContinuation} />
                    </div>
                  </div>
                  <FAB
                    appStore={appStore}
                    executeCode={this.executeCode}
                    stopExecution={this.stopExecution}
                    invokeContinuation={this.invokeContinuation}
                  />
                </div>
              </div>
            )}
          </Subscribe>
        </Provider>
      </Layout>
    );
  }
}

export default App;
