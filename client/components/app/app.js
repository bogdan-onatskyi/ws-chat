import React from 'react';
import {Provider} from 'react-redux';

import configureStore from '../../store/configure-store';

import MainView from '../main-view/main-view';

import './app.scss';

const store = configureStore();

const Index = () => (
    <Provider store={store}>
        <main className="app">
            <MainView/>
        </main>
    </Provider>
);

export default Index;
