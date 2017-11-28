import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import FormGroup from 'react-bootstrap/es/FormGroup';
import InputGroup from 'react-bootstrap/es/InputGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import Button from 'react-bootstrap/es/Button';
import Col from "react-bootstrap/es/Col";

import {
    setUserInfo, addPostToHistory, clearHistory,
    setMessage, setCanISendMessage, setSendMessageCountdown
} from '../../../actions/chat-actions';
import {setOnlineUsersList, setBannedUsersList, clearUsersList} from '../../../actions/users-list-actions';
import {setIsLoggedIn, setIsMuted, setIsBanned} from '../../../actions/user-actions';

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

        onlineUsersList: PropTypes.array.isRequired,
        bannedUsersList: PropTypes.array.isRequired,

        handleSetUserInfo: PropTypes.func.isRequired,
        handleAddPostToHistory: PropTypes.func.isRequired,
        handleClearHistory: PropTypes.func.isRequired,
        handleSetMessage: PropTypes.func.isRequired,
        handleSetCanISendMessage: PropTypes.func.isRequired,
        handleSetSendMessageCountdown: PropTypes.func.isRequired,

        handleSetOnlineUsersList: PropTypes.func.isRequired,
        handleSetBannedUsersList: PropTypes.func.isRequired,
        handleClearUsersList: PropTypes.func.isRequired,

        handleSetIsLoggedIn: PropTypes.func.isRequired,
        handleSetIsMuted: PropTypes.func.isRequired,
        handleSetIsBanned: PropTypes.func.isRequired,
    };

    timeOut = 5000;

    componentDidMount() {
        const {serverURL} = this.props;

        this.socket = new WebSocket(serverURL);

        const getOnlineUsersList = () => {
            const {userName} = this.props.user;

            const requestObject = {
                type: 'getOnlineUsersList',
                userName
            };
            this.socket.send(JSON.stringify(requestObject));
        };

        const getBannedUsersList = () => {
            const {userName} = this.props.user;

            const requestObject = {
                type: 'getBannedUsersList',
                userName
            };
            this.socket.send(JSON.stringify(requestObject));
        };

        const getUsersList = (userName) => {
            const {isAdmin} = this.props.user;

            getOnlineUsersList();
            if (isAdmin) getBannedUsersList();
        };

        this.socket.onopen = () => {
            const {userName, token} = this.props.user;

            let requestObject = {
                type: 'getUserInfo',
                userName,
                token,
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

            const {
                user, onlineUsersList, bannedUsersList, handleSetUserInfo, handleSetMessage,
                handleSetOnlineUsersList, handleSetBannedUsersList,
                handleSetIsLoggedIn, handleSetIsMuted, handleSetIsBanned,
                handleAddPostToHistory
            } = this.props;

            let receivedObject = {};
            try {
                receivedObject = JSON.parse(data);
            }
            catch (error) {
                console.log(`Ошибка JSON.parse(event.data) = ${error}`);
                return;
            }

            console.log(`receivedObject.type = ${receivedObject.type}`);
            switch (receivedObject.type) {
                case 'responseGetUserInfo':
                    handleSetUserInfo(receivedObject.data);
                    return;

                case 'responseGetOnlineUsersList':
                    handleSetOnlineUsersList(receivedObject.data);

                    onlineUsersList.forEach(u => {
                        if (user.userName === u.userName) {
                            handleSetIsMuted(u.isMuted);
                            handleSetIsBanned(u.isBanned);
                            handleSetMessage('');
                            if (u.isBanned) handleSetIsLoggedIn(false);
                        }
                    });
                    return;

                case 'responseGetBannedUsersList':
                    handleSetBannedUsersList(receivedObject.data);

                    bannedUsersList.forEach(u => {
                        if (user.userName === u.userName) {
                            handleSetIsMuted(u.isMuted);
                            handleSetIsBanned(u.isBanned);
                            handleSetMessage('');
                            if (u.isBanned) handleSetIsLoggedIn(false);
                        }
                    });
                    return;

                case 'responseNewUser':
                    handleAddPostToHistory(receivedObject);
                    getUsersList();
                    return;

                case 'responseNewMessage':
                    break;

                case 'responseUserExit':
                    getUsersList();
                    break;

                case 'responseSetIsMuted':
                    handleAddPostToHistory(receivedObject);
                    getUsersList();
                    return;

                case 'responseSetIsBanned':
                    handleAddPostToHistory(receivedObject);
                    getUsersList();
                    return;

                default:
                    return;
            }

            handleAddPostToHistory(receivedObject);
        };

        this.socket.onclose = event => {
            const {handleClearHistory, handleClearUsersList} = this.props;

            handleClearHistory();
            handleClearUsersList();

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
        const {userName} = this.props.user;

        const requestObject = {
            type: 'userExit',
            userName,
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

    handleIsBanned = (userName, isBanned) => {
        const requestObject = {
            type: 'setIsBanned',
            userName,
            isBanned
        };

        this.socket.send(JSON.stringify(requestObject));
    };

    handleSendMessage = (e) => {
        e.preventDefault();

        const {
            user, message, canISendMessage,
            handleSetMessage, handleSetCanISendMessage, handleSetSendMessageCountdown
        } = this.props;

        const {userName} = user;

        if (canISendMessage) {
            if (message !== '') {
                handleSetCanISendMessage(false);

                const requestObject = {
                    type: 'newMessage',
                    userName,
                    message
                };

                this.socket.send(JSON.stringify(requestObject));
                handleSetMessage('');

                let timeOut = this.timeOut;

                const timerId = setInterval(() => {
                    timeOut -= 1000;
                    handleSetSendMessageCountdown(timeOut);

                    if (this.props.sendMessageCountdown <= 0) {
                        clearInterval(timerId);
                        handleSetCanISendMessage(true);
                        handleSetSendMessageCountdown(0);
                    }
                }, 1000);

                handleSetSendMessageCountdown(timeOut);
            }
        }
    };

    handleMessageChange = (e) => {
        if (this.props.user.isMuted) return;

        const {handleSetMessage, canISendMessage} = this.props;

        if (canISendMessage) {
            handleSetMessage(e.target.value);
        }
    };

    messagePlaceholder = () => {
        if (this.props.user.isMuted) return 'You are muted by Admin...';

        const countdown = this.props.sendMessageCountdown / 1000;

        return countdown
            ? `Wait ${countdown} second${countdown === 1 ? '' : 's'} to send a message...`
            : 'Enter your message here...';
    };

    handleExitChat = () => {
        this.props.handleSetIsLoggedIn(false);
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
                              handleIsMuted={this.handleIsMuted}
                              handleIsBanned={this.handleIsBanned}/>;
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

        onlineUsersList: state.usersList.onlineUsersList,
        bannedUsersList: state.usersList.bannedUsersList,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        handleSetUserInfo: data => dispatch(setUserInfo(data)),

        handleAddPostToHistory: data => dispatch(addPostToHistory(data)),
        handleClearHistory: () => dispatch(clearHistory()),
        handleSetMessage: data => dispatch(setMessage(data)),
        handleSetCanISendMessage: data => dispatch(setCanISendMessage(data)),
        handleSetSendMessageCountdown: data => dispatch(setSendMessageCountdown(data)),

        handleSetOnlineUsersList: data => dispatch(setOnlineUsersList(data)),
        handleSetBannedUsersList: data => dispatch(setBannedUsersList(data)),
        handleClearUsersList: data => dispatch(clearUsersList(data)),

        handleSetIsLoggedIn: bool => dispatch(setIsLoggedIn(bool)),
        handleSetIsMuted: bool => dispatch(setIsMuted(bool)),
        handleSetIsBanned: bool => dispatch(setIsBanned(bool)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatView);