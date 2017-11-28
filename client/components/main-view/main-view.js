import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import axios from 'axios';

import FormGroup from 'react-bootstrap/es/FormGroup';
import InputGroup from 'react-bootstrap/es/InputGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import Button from 'react-bootstrap/es/Button';

import ChatView from './chat-view/chat-view';

import {setAuth, setIsLoggedIn, setUserName, setPassword, setToken} from '../../actions/user-actions'

import './main-view.scss';

class MainView extends Component {
    static PropTypes = {
        user: PropTypes.object.isRequired,

        handleAuth: PropTypes.func.isRequired,
        handleIsLoggedIn: PropTypes.func.isRequired,
        handleUserName: PropTypes.func.isRequired,
        handlePassword: PropTypes.func.isRequired,
        handleToken: PropTypes.func.isRequired
    };

    handleLogin = (e) => {
        e.preventDefault();

        const {user, handleAuth, handleIsLoggedIn, handleUserName} = this.props;
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

                            handleIsLoggedIn(data.auth === 'ok');

                            handleAuth(data.auth === 'ok'
                                ? ''
                                : data.auth
                            );

                            handleUserName(data.userName);

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
        this.props.handleUserName(e.target.value);
    };

    handleChangePassword = (e) => {
        this.props.handlePassword(e.target.value);
    };

    renderLoginForm = () => {
        const {userName, password, auth} = this.props.user;
        const authMessage = auth === 'ok' ? "" : auth;

        return (
            <form className="main__loginForm" name="loginForm" onSubmit={this.handleLogin}>
                <FormGroup>
                    <InputGroup>
                        <FormControl type="text" name="userName" value={userName}
                                     onChange={this.handleChangeUserName}/>
                        <FormControl type="text" name="password" value={password}
                                     onChange={this.handleChangePassword}/>
                        <Button bsStyle="primary" type="submit">Login</Button>
                    </InputGroup>
                    <p>{authMessage}</p>
                </FormGroup>
            </form>
        );
    };

    render = () => this.props.user.isLoggedIn
        ? <ChatView serverURL={`ws://localhost:8080`}/>
        // ? <ChatView serverURL={`ws://localhost:8080?token=${this.props.user.token}`}/>
        : this.renderLoginForm();
}

function mapStateToProps(state) {
    return {
        user: state.user
    };
}

function mapDispatchToProps(dispatch) {
    return {
        handleAuth: bool => dispatch(setAuth(bool)),
        handleIsLoggedIn: bool => dispatch(setIsLoggedIn(bool)),
        handleUserName: userName => dispatch(setUserName(userName)),
        handlePassword: password => dispatch(setPassword(password)),
        handleToken: token => dispatch(setToken(token)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainView);