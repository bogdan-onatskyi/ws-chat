import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import FormGroup from 'react-bootstrap/es/FormGroup';
import InputGroup from 'react-bootstrap/es/InputGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import Button from 'react-bootstrap/es/Button';
import Col from "react-bootstrap/es/Col";

import {
    getDataFromServer, addPostToHistory, clearHistory,
    setMessage, setCanISendMessage, setSendMessageCountdown
} from '../../../actions/chat-actions';
import {setUsersList, clearUsersList} from '../../../actions/users-list-actions';
import {setIsLoggedIn} from '../../../actions/user-actions';

import HistoryView from './history-view';
import UsersListView from './users-list-view';

import './chat-view.scss';

class ChatView extends Component {
    static PropTypes = {
        serverURL: PropTypes.string.isRequired,

        user: PropTypes.object.isRequired,
        history: PropTypes.array.isRequired,
        message: PropTypes.string.isRequired,
        canISendMessage: PropTypes.bool.isRequired,
        sendMessageCountdown: PropTypes.number.isRequired,

        getDataFromServer: PropTypes.func.isRequired,
        addPostToHistory: PropTypes.func.isRequired,
        clearHistory: PropTypes.func.isRequired,
        setMessage: PropTypes.func.isRequired,
        setCanISendMessage: PropTypes.func.isRequired,
        setSendMessageCountdown: PropTypes.func.isRequired,

        setIsLoggedIn: PropTypes.func.isRequired,
    };

    timeOut = 5000;

    componentDidMount() {
        const {
            serverURL,
            user, getDataFromServer,
            addPostToHistory, clearHistory,
            setUsersList, clearUsersList
        } = this.props;
        const {userName, password} = user;

        this.socket = new WebSocket(serverURL);

        const getUsersList = () => {
            const requestObject = {
                type: 'getUsersList',
                userName
            };
            this.socket.send(JSON.stringify(requestObject));
        };

        this.socket.onopen = event => {
            let requestObject = {
                type: 'getUserInfo',
                userName,
                password,
            };
            this.socket.send(JSON.stringify(requestObject));

            requestObject = {
                type: 'newUser',
                userName
            };
            this.socket.send(JSON.stringify(requestObject));

            getUsersList();
        };

        this.socket.onmessage = event => {
            const {data} = event;

            if (!data) return;

            let receivedObject = {};
            try {
                receivedObject = JSON.parse(data);
            }
            catch (error) {
                console.log(`Ошибка JSON.parse(event.data) = ${error}`);
                return;
            }

            switch (receivedObject.type) {
                case 'responseGetUserInfo':
                    getDataFromServer(receivedObject.data);
                    return;

                case 'responseGetUsersList':
                    setUsersList(receivedObject.data);
                    return;

                case 'responseNewUser':
                    addPostToHistory(receivedObject);
                    getUsersList();
                    return;

                case 'responseNewMessage':
                    break;

                case 'responseUserExit':
                    getUsersList();
                    break;

                case 'responseIsMuted':
                    console.log(` 117 `);
                    getUsersList();
                    break;

                default:
                    return;
            }

            addPostToHistory(receivedObject);
        };

        this.socket.onclose = event => {
            clearHistory();
            clearUsersList();

            event.wasClean
                ? console.log('Соединение закрыто чисто.')
                : console.log('Обрыв соединения');
            console.log(`Код: ${event.code}`);
        };

        this.socket.onerror = error => {
            console.log(`Websocket error ${error.message}`);
        };
    };

    componentWillUnmount() {
        const requestObject = {
            type: 'userExit',
            userName: this.props.user.userName,
        };

        this.socket.send(JSON.stringify(requestObject));
        this.socket.close();
    };

    handleIsMuted = (userName, isMuted) => {
        const requestObject = {
            type: 'setIsMuted',
            userName,
            isMuted
        };

        this.socket.send(JSON.stringify(requestObject));
    };

    handleIsBaned = (userName, isMuted) => {
        // const requestObject = {
        //     type: 'setIsMuted',
        //     userName,
        //     isMuted
        // };
        //
        // this.socket.send(JSON.stringify(requestObject));
    };

    handleSendMessage = (e) => {
        e.preventDefault();

        const {user, message, canISendMessage, setMessage, setCanISendMessage, setSendMessageCountdown} = this.props;
        const {userName} = user;

        if (canISendMessage) {
            if (message !== '') {
                setCanISendMessage(false);

                const requestObject = {
                    type: 'newMessage',
                    userName,
                    message
                };

                this.socket.send(JSON.stringify(requestObject));
                setMessage('');

                let timeOut = this.timeOut;

                const timerId = setInterval(() => {
                    timeOut -= 1000;
                    setSendMessageCountdown(timeOut);

                    if (this.props.sendMessageCountdown <= 0) {
                        clearInterval(timerId);
                        setCanISendMessage(true);
                        setSendMessageCountdown(0);
                    }
                }, 1000);

                setSendMessageCountdown(timeOut);
            }
        }
    };

    handleMessageChange = (e) => {
        const {setMessage, canISendMessage} = this.props;

        if (canISendMessage) {
            setMessage(e.target.value);
        }
    };

    messagePlaceholder = () => {
        const countdown = this.props.sendMessageCountdown / 1000;

        return countdown
            ? `Wait ${countdown} second${countdown === 1 ? '' : 's'} to send a message...`
            : 'Enter your message here...';
    };

    handleExitChat = () => {
        this.props.setIsLoggedIn(false);
    };

    renderChat = () => {
        const {user, serverURL, message, history, canISendMessage} = this.props;

        return (
            <Col xs={9} className="chat-view__chat">
                <h4><strong>{serverURL}</strong></h4>

                <form name="chatForm" onSubmit={this.handleSendMessage}>
                    <HistoryView history={history}/>
                    <FormGroup>
                        <InputGroup>
                            <InputGroup.Addon>{user.userName}</InputGroup.Addon>
                            <FormControl type="text" name="message" autoFocus={true}
                                         value={message}
                                         placeholder={this.messagePlaceholder()}
                                         onChange={this.handleMessageChange}/>
                            <InputGroup.Button>
                                <Button bsStyle="primary" type="submit" autoFocus={false}
                                        disabled={!canISendMessage || message === ''}>
                                    Send...
                                </Button>
                            </InputGroup.Button>
                        </InputGroup>
                    </FormGroup>
                </form>
                <div>
                    <Button className="chat-view__chat--exit-button" bsStyle="primary"
                            onClick={this.handleExitChat}>Exit chat</Button>
                </div>
            </Col>
        );
    };

    renderUsersList = () => {
        const {isAdmin} = this.props.user;

        return <UsersListView isAdmin={isAdmin}
                              setIsMuted={this.handleIsMuted}
                              setIsBaned={this.handleIsBaned}/>;
    };

    render = () => (
        <div className="chat-view">
            {this.renderChat()}
            {this.renderUsersList()}
        </div>
    );
}

function mapStateToProps(state) {
    return {
        user: state.user,
        history: state.chat.history,
        message: state.chat.message,
        canISendMessage: state.chat.canISendMessage,
        sendMessageCountdown: state.chat.sendMessageCountdown,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        getDataFromServer: data => dispatch(getDataFromServer(data)),
        addPostToHistory: data => dispatch(addPostToHistory(data)),
        clearHistory: () => dispatch(clearHistory()),
        setMessage: data => dispatch(setMessage(data)),
        setCanISendMessage: data => dispatch(setCanISendMessage(data)),
        setSendMessageCountdown: data => dispatch(setSendMessageCountdown(data)),

        setUsersList: data => dispatch(setUsersList(data)),
        clearUsersList: data => dispatch(clearUsersList(data)),

        setIsLoggedIn: bool => dispatch(setIsLoggedIn(bool)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatView);