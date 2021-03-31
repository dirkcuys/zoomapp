import React from 'react';
import ReactDOM from 'react-dom';
import 'popper.js';
import 'bootstrap';
import './custom.scss';
import App from './App';
//import store from './app/store';
import configureStore from './store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';
import {connectSocket} from './transport';

const reactProps = JSON.parse(document.getElementById('reactProps').textContent);
const {meeting, zoomUser, userRegistration, shortCode} = reactProps;

const store = configureStore(reactProps);

// TODO maybe there's a better way to indicate when to connect? a dispatch action inside the component requiring it?
if (meeting){
  const url = `${window.location.origin.replace(/^http/, 'ws')}/ws/meeting/${meeting.slug}`;
  connectSocket(url, store);
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

$(function () {
  $('[data-toggle="popover"]').popover()
})
