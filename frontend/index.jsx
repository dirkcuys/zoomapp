import React from 'react';
import ReactDOM from 'react-dom';
import './custom.scss';
import App from './App';
//import store from './app/store';
import configureStore from './store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';
import {connectSocket} from './transport';

const reactProps = JSON.parse(document.getElementById('reactProps').textContent);

const store = configureStore();

if (reactProps.meeting){
  connectSocket(`ws://localhost:8000/ws/meeting/${reactProps.meeting.slug}`, store);
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App {...reactProps} />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
