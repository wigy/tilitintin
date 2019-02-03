import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'mobx-react';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import registerServiceWorker from './registerServiceWorker';
import Store from './Stores/Store';
import Cursor from './Stores/Cursor';
import i18n from './i18n';
import './index.css';

let store = new Store();
let cursor = new Cursor(store);

ReactDOM.render(
  <I18nextProvider i18n={ i18n }>
    <Provider store={store} cursor={cursor}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </I18nextProvider>,
  document.getElementById('root')
);

registerServiceWorker();
