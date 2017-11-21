import React from 'react';
import ReactDOM from 'react-dom';
import {AppContainer} from 'react-hot-loader';

import App from '../components/app/app';

import 'bootstrap/dist/css/bootstrap.min.css';

import './index.scss';

const render = Component => {
    ReactDOM.render(
        <AppContainer warnings={false}>
            <Component/>
        </AppContainer>,
        document.getElementById('app'),
    );
};

render(App);

if (module.hot) {
    module.hot.accept('../components/app/app', () => {
        render(App);
    });
}