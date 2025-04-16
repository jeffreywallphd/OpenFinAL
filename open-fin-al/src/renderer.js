import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './View/App';

const root = ReactDOM.createRoot(document.getElementById('root'));

React.StrictMode //can cause weird side effects, such as stock data running twice on page load
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
