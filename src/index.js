import React from 'react';
import ReactDOM from 'react-dom';
import { InitThree } from './components/Scene';
import './index.css';

// import App from './App'/
// import reportWebVitals from './reportWebVitals';

// ReactDOM.render(
//   <React.StrictMode>
//     <InitThree />
//   </React.StrictMode>,
//   document.getElementById('root'),
// );

export default () => {
  return (
    <div>
      <InitThree>Page index</InitThree>
    </div>
  );
};

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
