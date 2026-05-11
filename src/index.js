// @flow

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import './utils/addtohomescreen.js';
import './utils/addtohomescreen.css';

ReactDOM.render(<App showUpdate={false} />, document.getElementById('root'));

registerServiceWorker();
// offline-plugin removed; PWA handled by vite-plugin-pwa

window.addToHomescreen({
  lifespan: 0,
  skipFirstVisit: false,
  maxDisplayCount: 1,
  validLocation: [/^\/$/]
});
