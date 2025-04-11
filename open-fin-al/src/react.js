// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './View/App/App';

const root = ReactDOM.createRoot(document.getElementById('root'));

/* to use in production
root.render(
  <App />
);
*/

//React.StrictMode is good for development
//React.StrictMode can cause weird side effects, such as stock data running twice on page load
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);