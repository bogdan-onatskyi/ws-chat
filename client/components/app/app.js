import React from 'react';
import {Provider} from 'react-redux';

import configureStore from '../../store/configure-store';

import LoginView from '../login/login-view.connect';

import './app.scss';

const store = configureStore();

const Index = () => (
    <Provider store={store}>
        <main className="app">
            <LoginView/>
        </main>
    </Provider>
);

export default Index;
