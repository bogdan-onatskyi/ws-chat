import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import axios from 'axios';

import FormGroup from 'react-bootstrap/es/FormGroup';
import InputGroup from 'react-bootstrap/es/InputGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import Button from 'react-bootstrap/es/Button';

import ChatView from '../chat/chat-view.connect';

import './login-view.scss';

class LoginView extends Component {
    handleLogin = (e) => {
        e.preventDefault();

        if (this.getValidationState() === 'error') return;

        const {user, setAuth, setIsLoggedIn, setUserName} = this.props;
        const {userName, password} = user;

        const request = {
            userName,
            password,
        };

        Promise.resolve(request)
            .then(request => {
                return (
                    axios.post('/login', request, {timeout: 2000})
                        .then(response => {
                            const {data} = response;

                            setIsLoggedIn(data.auth === 'ok');

                            setAuth(data.auth === 'ok'
                                ? ''
                                : data.auth
                            );

                            setUserName(data.userName);

                            setTimeout(() => {
                                this.props.setAuth('');
                            }, 5000);

                            return data;
                        })
                        .catch(error => {
                            console.log(error);
                            return {
                                Auth: 'networkError'
                            };
                        })
                );
            });
    };

    handleChangeUserName = (e) => {
        this.props.setUserName(e.target.value);
    };

    handleChangePassword = (e) => {
        this.props.setPassword(e.target.value);
    };

    getValidationState = () => {
        const {userName} = this.props.user;

        if (userName.length < 3 || userName.match(/\W/ig)) return 'error';

        return null;
    };

    renderLoginForm = () => {
        const {userName, password, auth} = this.props.user;
        const authMessage = auth === 'ok' ? "" : auth;

        return (
            <form className="main__loginForm" name="loginForm" onSubmit={this.handleLogin}>
                <FormGroup>
                    <InputGroup>
                        <FormGroup validationState={this.getValidationState()}>
                            <FormControl type="text" name="userName" value={userName}
                                         onChange={this.handleChangeUserName}/>
                        </FormGroup>

                        <FormControl type="password" name="password" value={password}
                                     onChange={this.handleChangePassword}/>
                        <Button bsStyle="primary" type="submit">Login</Button>
                    </InputGroup>
                    <p className="main__loginForm--auth">{authMessage}</p>
                </FormGroup>
            </form>
        );
    };

    render = () => this.props.user.isLoggedIn
        ? <ChatView serverURL={`ws://localhost:8080`}/>
        : this.renderLoginForm();
}

export default LoginView;