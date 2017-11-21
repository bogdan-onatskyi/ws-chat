import React from 'react';

// import Header from '../header/header';
import MainView from '../main-view/main-view';
// import Footer from '../footer/footer';

import './app.scss';

const Index = () => (
    <div className="app">
        {/*<Header text="Chat application"/>*/}
        <MainView historyLength={10}/>
        {/*<Footer/>*/}
    </div>
);

export default Index;
