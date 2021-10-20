import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import logdna from '@logdna/browser';

logdna.init(process.env.REACT_APP_LOGDNA_INGEST_KEY || 'NO_KEY_GIVEN');
logdna.addContext({
  appName: 'react-test-app',
  version: 'v0.0.1.beta',
});

const x = undefined;
setTimeout(() => {
  // @ts-ignore
  console.log(x.notdefinedproperty);
}, 500);

ReactDOM.render(
  <React.StrictMode>
    <div style={{ margin: 16 }}>LogDNA Browser Logger Example - Open your browser dev tools console to view the client-side error thrown.</div>
    <div style={{ margin: 16 }}>
      View <code>./src/index.tsx</code> in the example folder to see where the Browser Logger is instantiated.
    </div>
  </React.StrictMode>,
  document.getElementById('root'),
);
