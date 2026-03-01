import React, { createRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/keymap/sublime';
import '../dracula.css';
import StoreFacade from './StoreFacade';

export default class AppContainer extends StoreFacade {
  constructor() {
    super({
      createTabRef: () => createRef(),
      renderEditor: (code, ref, onChanges) => {
        const options = {
          theme: 'dracula',
          tabSize: 4,
          keyMap: 'sublime',
          mode: 'js',
          lineNumbers: true,
        };

        return <CodeMirror onChanges={onChanges} ref={ref} value={code} options={options} />;
      },
    });
  }
}
