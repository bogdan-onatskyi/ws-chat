import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import axios from 'axios';

import FormGroup from 'react-bootstrap/es/FormGroup';
import InputGroup from 'react-bootstrap/es/InputGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import Button from 'react-bootstrap/es/Button';

import ChatView from './chat-view/chat-view';

import {setIsLoggedIn, setUserName, setPassword} from '../../actions/user-actions'

import './main-view.scss';

class MainView extends Component {
    static PropTypes = {
        user: PropTypes.object.isRequired,

        setIsLoggedIn: PropTypes.func.isRequired,
        setUserName: PropTypes.func.isRequired,
        setPassword: PropTypes.func.isRequired
    };

    state = {
        Auth: ''
    };


    handleLogin = (e) => {
        e.preventDefault();

        const {user, setIsLoggedIn} = this.props;
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

                            this.setState(state => state.Auth = data.auth === 'ok'
                                ? ''
                                : data.auth
                            );

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

    renderLoginForm = () => {
        const {userName, password} = this.props.user;

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
                    <p>{this.state.Auth}</p>
                </FormGroup>
            </form>
        );
    };

    render = () => this.props.user.isLoggedIn
        ? <ChatView serverURL="ws://localhost:8080?token={this.props.user.token}"/>
        : this.renderLoginForm();
}

function mapStateToProps(state) {
    return {
        user: state.user
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setIsLoggedIn: bool => dispatch(setIsLoggedIn(bool)),
        setUserName: userName => dispatch(setUserName(userName)),
        setPassword: password => dispatch(setPassword(password)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainView);