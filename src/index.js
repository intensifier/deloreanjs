import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider, Subscribe } from 'unstated';
import AppContainer from './containers/AppContainer';
import './index.css';
import 'simplebar/dist/simplebar.min.css';
import App from './App';

if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
  window.global = window;
}

const root = createRoot(document.getElementById('root'));

root.render(
  <Provider>
    <Subscribe to={[AppContainer]}>{(store) => <App store={store} />}</Subscribe>
  </Provider>,
);
