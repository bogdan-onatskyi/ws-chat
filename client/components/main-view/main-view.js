import React, {Component} from 'react';

import axios from 'axios';

import LoginView from './login-view/login-view';
import ChatView from './chat-view/chat-view';

import {toString} from '../../../utils/utils';

import './main-view.scss';

class MainView extends Component {
    state = {
        userName: 'user',
        password: 'password',

        isLoggedIn: false,
    };

    handleLogin = (e) => {
        e.preventDefault();

        const request = {
            userName: this.state.userName,
            password: this.state.password,
        };

        Promise.resolve(request)
            .then(request => {
                    return (
                        // axios.post('http://localhost:8080/login', request, {timeout: 2000})
                        axios.post('/login', request, {timeout: 2000})
                            .then(response => {
                                const {data} = response;

                                console.log(toString('Server answered:', data));

                                this.setState({
                                    ...this.state,
                                    isLoggedIn: data.auth === 'ok'
                                });

                                console.log(`data.auth = ${data.auth}`);

                                return data;
                            })
                            .catch(error => {
                                console.log(error);
                                return {Auth: 'networkError'};
                            })
                    )
                }
            )
    };

    handleChange = (e) => {
        this.setState({
            ...this.state,
            [e.target.name]: e.target.value
        });
    };

    handleExitChat = () => {
        this.setState({
            ...this.state,
            isLoggedIn: false
        });
    };

    render() {
        return (
            <main className="main">
                {this.state.isLoggedIn
                    ? <ChatView historyLength={20} serverURL="ws://localhost:8080"
                                userName={this.state.userName}
                                handleExitChat={this.handleExitChat}/>

                    : <LoginView userName={this.state.userName} password={this.state.password}
                                 handleLogin={this.handleLogin} handleChange={this.handleChange}/>
                }
            </main>
        );
    };
}

export default MainView;