import React, {Component} from 'react';

import FormGroup from 'react-bootstrap/es/FormGroup';
import InputGroup from 'react-bootstrap/es/InputGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import Button from 'react-bootstrap/es/Button';
import Col from "react-bootstrap/es/Col";

import HistoryView from './history/history.connect';
import UsersListView from './users-list/users-list.connect';

import './chat-view.scss';

class ChatView extends Component {
    timeOut = 5000;

    componentDidMount() {
        const {serverURL} = this.props;

        this.socket = new WebSocket(serverURL);

        const newUser = () => {
            const {userName} = this.props.user;
            const requestObject = {
                type: 'newUser',
                userName
            };

            this.socket.send(JSON.stringify(requestObject));
        };

        const getUserInfo = () => {
            const {userName, token} = this.props.user;
            const requestObject = {
                type: 'getUserInfo',
                userName,
                token,
            };

            this.socket.send(JSON.stringify(requestObject));
        };

        const getOnlineUsersList = () => {
            const {userName} = this.props.user;
            const requestObject = {
                type: 'getOnlineUsersList',
                userName
            };

            this.socket.send(JSON.stringify(requestObject));
        };

        const getBannedUsersList = () => {
            const {userName, isAdmin} = this.props.user;

            if (!isAdmin) return;

            const requestObject = {
                type: 'getBannedUsersList',
                userName
            };

            this.socket.send(JSON.stringify(requestObject));
        };

        const getAllUsersList = () => {
            const {userName, isAdmin} = this.props.user;

            if (!isAdmin) return;

            const requestObject = {
                type: 'getAllUsersList',
                userName
            };

            this.socket.send(JSON.stringify(requestObject));
        };

        const getUsersList = () => {
            getOnlineUsersList();
            getBannedUsersList();
            getAllUsersList();
        };

        this.socket.onopen = () => {
            getUserInfo();
            newUser();
            getUsersList();
        };

        this.socket.onmessage = event => {
            const {data} = event;

            if (!data) return;

            const {
                setUserInfo, setMessage,
                setOnlineUsersList, setBannedUsersList, setAllUsersList,
                setIsLoggedIn, setIsMuted, setIsBanned,
                addPostToHistory
            } = this.props;

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
                    setUserInfo(receivedObject.data);
                    return;

                case 'responseGetOnlineUsersList':
                    setOnlineUsersList(receivedObject.data);

                    receivedObject.data.forEach(onlineUser => {
                        if (this.props.user.userName === onlineUser.userName) {
                            setIsMuted(onlineUser.isMuted);
                            setIsBanned(onlineUser.isBanned);
                            setMessage('');
                            if (onlineUser.isBanned) setIsLoggedIn(false);
                        }
                    });
                    return;

                case 'responseGetBannedUsersList':
                    setBannedUsersList(receivedObject.data);

                    receivedObject.data.forEach(bannedUser => {
                        if (this.props.user.userName === bannedUser.userName) {
                            setIsMuted(bannedUser.isMuted);
                            setIsBanned(bannedUser.isBanned);
                            setMessage('');
                            if (bannedUser.isBanned) setIsLoggedIn(false);
                        }
                    });
                    return;

                case 'responseGetAllUsersList':
                    setAllUsersList(receivedObject.data);

                    receivedObject.data.forEach(user => {
                        if (this.props.user.userName === user.userName) {
                            setIsMuted(user.isMuted);
                            setIsBanned(user.isBanned);
                            setMessage('');
                            if (user.isBanned) setIsLoggedIn(false);
                        }
                    });
                    return;

                case 'responseNewUser':
                    getUsersList();
                    break;

                case 'responseNewMessage':
                    break;

                case 'responseUserExit':
                    getUsersList();
                    break;

                case 'responseSetIsMuted':
                    getUsersList();
                    break;

                case 'responseSetIsBanned':
                    getUsersList();
                    break;

                default:
                    return;
            }
            addPostToHistory(receivedObject);
        };

        this.socket.onclose = event => {
            const {clearHistory, clearUsersList} = this.props;

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
            setMessage, setCanISendMessage, setSendMessageCountdown
        } = this.props;

        const {userName, color} = user;

        if (canISendMessage) {
            if (message !== '') {
                setCanISendMessage(false);

                const requestObject = {
                    type: 'newMessage',
                    userName,
                    color,
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
        if (this.props.user.isMuted) return;

        const {setMessage, canISendMessage} = this.props;

        if (canISendMessage) {
            setMessage(e.target.value);
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
        this.props.setIsLoggedIn(false);
    };

    renderChat = () => {
        const {user, serverURL, message, history, canISendMessage} = this.props;

        return (
            <Col xs={9} className="chat-view__chat">
                <p className="chat-view__chat--title">{serverURL}</p>

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

export default ChatView;