import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import FormGroup from 'react-bootstrap/es/FormGroup';
import InputGroup from 'react-bootstrap/es/InputGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import Button from 'react-bootstrap/es/Button';

import {getDataFromServer, addPostToHistory, setMessage} from '../../../actions/chat-actions';
import {setIsLoggedIn} from '../../../actions/user-actions';

import HistoryView from './history-view';

import './chat-view.scss';

class ChatView extends Component {
    static PropTypes = {
        serverURL: PropTypes.string.isRequired,

        user: PropTypes.object.isRequired,
        history: PropTypes.array.isRequired,
        message: PropTypes.string.isRequired,

        getDataFromServer: PropTypes.func.isRequired,
        addPostToHistory: PropTypes.func.isRequired,
        setMessage: PropTypes.func.isRequired,

        setIsLoggedIn: PropTypes.func.isRequired,
    };

    state = {
        canISendMessage: true
    };

    timeOut = 1000;

    componentDidMount() {
        const {user, addPostToHistory} = this.props;
        const {userName, password} = user;

        this.socket = new WebSocket(this.props.serverURL);

        this.socket.onopen = event => {
            const obj = {
                type: 'initMsg',
                userName,
                password,
            };

            this.socket.send(JSON.stringify(obj));

            obj.type = 'userMsg';
            obj.message = null;
            this.socket.send(JSON.stringify(obj));
        };

        this.socket.onmessage = event => {
            const {data} = event;

            if (!data) return;

            let obj;
            try {
                obj = JSON.parse(data);
            }
            catch (err) {
                console.log(`Ошибка JSON.parse(event.data) = ${err}`);
                return;
            }

            if (obj.type === 'initMsg') {
                getDataFromServer(obj.data);
                return;
            }

            addPostToHistory(obj);
        };

        this.socket.onclose = (event) => {
            event.wasClean
                ? console.log('Соединение закрыто чисто.')
                : console.log('Обрыв соединения');
            console.log(`Код: ${event.code}`);
        };

        this.socket.onerror = (error) => {
            console.log("Ошибка " + error.message);
        };
    };

    componentWillUnmount() {
        // todo Закрыть соединение
        const obj = {
            type: 'userExit',
            userName: this.state.userName,
        };
        this.socket.send(JSON.stringify(obj));

        console.log('Соединение закрыто.');
    };

    handleMessageChange = (e) => {
        setMessage(e.target.value);
    };

    handleSendMessage = (e) => {
        e.preventDefault();

        const {user, message} = this.props;
        const {userName} = user;

        if (this.state.canISendMessage) {
            if (message !== '') {
                const obj = {
                    type: 'userMsg',
                    userName,
                    message
                };
                this.socket.send(JSON.stringify(obj));

                this.setState(state => {
                    state.canISendMessage = false;
                });

                setTimeout(() => {
                    this.setState(state => {
                        state.canISendMessage = true;
                    });
                }, this.timeOut);
            }
        }
    };

    handleExitChat = () => {
        setIsLoggedIn(false);
    };

    render() {
        const {serverURL, message, history} = this.props;

        return (
            <div className="chat">
                <p className="chat__addr">{serverURL}</p>

                <form name="chatForm" onSubmit={this.handleSendMessage}>
                    <HistoryView history={history}/>

                    <FormGroup>
                        <InputGroup>
                            <FormControl type="text" name="message"
                                         value={message}
                                         onChange={this.handleMessageChange}/>
                            <InputGroup.Button>
                                <Button bsStyle="primary" type="submit"
                                        disabled={this.state.canISendMessage}>Send...</Button>
                            </InputGroup.Button>
                        </InputGroup>
                    </FormGroup>
                </form>

                <Button bsStyle="primary" onClick={this.handleExitChat}>Exit...</Button>
            </div>
        );
    };
}

function mapStateToProps(state) {
    return {
        user: state.user.user,
        history: state.chat.history,
        message: state.chat.message,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        getDataFromServer: data => dispatch(getDataFromServer(data)),
        addPostToHistory: data => dispatch(addPostToHistory(data)),
        setMessage: data => dispatch(setMessage(data)),

        setIsLoggedIn: bool => dispatch(setIsLoggedIn(bool)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatView);