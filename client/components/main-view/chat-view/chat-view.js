import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import FormGroup from 'react-bootstrap/es/FormGroup';
import InputGroup from 'react-bootstrap/es/InputGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import Button from 'react-bootstrap/es/Button';

import {
    getDataFromServer, addPostToHistory, clearHistory,
    setMessage, setCanISendMessage, setSendMessageCountdown
} from '../../../actions/chat-actions';

import {setIsLoggedIn} from '../../../actions/user-actions';

import HistoryView from './history-view';

import './chat-view.scss';

class ChatView extends Component {
    static PropTypes = {
        serverURL: PropTypes.string.isRequired,

        user: PropTypes.object.isRequired,
        history: PropTypes.array.isRequired,
        message: PropTypes.string.isRequired,

        handleGetDataFromServer: PropTypes.func.isRequired,
        handleAddPostToHistory: PropTypes.func.isRequired,
        handleClearHistory: PropTypes.func.isRequired,
        handleSetMessage: PropTypes.func.isRequired,
        handleSetCanISendMessage: PropTypes.func.isRequired,

        handleSetIsLoggedIn: PropTypes.func.isRequired,
    };

    timeOut = 2000;

    componentDidMount() {
        const {user, handleGetDataFromServer, handleAddPostToHistory, handleClearHistory} = this.props;
        const {userName, password} = user;

        this.socket = new WebSocket(this.props.serverURL);

        this.socket.onopen = event => {
            const sentObject = {
                type: 'initMsg',
                userName,
                password,
            };

            this.socket.send(JSON.stringify(sentObject));

            sentObject.type = 'userMsg';
            sentObject.message = null;
            this.socket.send(JSON.stringify(sentObject));
        };

        this.socket.onmessage = event => {
            const {data} = event;
            let receivedObject = {};

            if (!data) return;

            try {
                receivedObject = JSON.parse(data);
            }
            catch (error) {
                console.log(`Ошибка JSON.parse(event.data) = ${error}`);
                return;
            }

            console.log(`74 receivedObject.userName = ${receivedObject.userName}`);

            if (receivedObject.type === 'initMsg') {
                handleGetDataFromServer(receivedObject.data);
                return;
            }

            if (receivedObject.type === 'userExit') {
                if (receivedObject.userName === userName) {
                    handleClearHistory();
                    return;
                }
            }

            handleAddPostToHistory(receivedObject);
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
        const sentObject = {
            type: 'userExit',
            userName: this.props.user.userName,
        };

        this.socket.send(JSON.stringify(sentObject));

        console.log('Соединение закрыто.');
    };

    handleMessageChange = (e) => {
        this.props.handleSetCanISendMessage(e.target.value !== '' && e.target.value.length < 200);
        this.props.handleSetMessage(e.target.value);
    };

    handleSendMessage = (e) => {
        e.preventDefault();

        const {user, message, canISendMessage, handleSetCanISendMessage, handleSetSendMessageCountdown} = this.props;
        const {userName} = user;

        if (canISendMessage) {
            if (message !== '') {
                handleSetCanISendMessage(false);

                const sentObject = {
                    type: 'userMsg',
                    userName,
                    message
                };

                this.socket.send(JSON.stringify(sentObject));

                let timeOut = this.timeOut;
                handleSetSendMessageCountdown(timeOut); // todo Почему пауза в 1 секунду и не отрисовывает значение 10?

                const timerId = setInterval(() => {
                    timeOut -= 1000;
                    handleSetSendMessageCountdown(timeOut);

                    if (this.props.sendMessageCountdown <= 0) {
                        clearInterval(timerId);
                        handleSetCanISendMessage(true);
                    }
                }, 1000);

                handleSetSendMessageCountdown(0);
            }
        }
    };

    handleExitChat = () => {
        this.props.handleSetIsLoggedIn(false);
    };

    render() {
        const {user, serverURL, message, history, canISendMessage, sendMessageCountdown} = this.props;
        const sendButtonText = sendMessageCountdown !== 0 ? sendMessageCountdown / 1000 : 'Send...';

        return (
            <div className="chat">
                <p className="chat__addr">{serverURL}</p>

                <form name="chatForm" onSubmit={this.handleSendMessage}>

                    <HistoryView history={history}/>

                    <FormGroup>
                        <InputGroup>
                            <InputGroup.Addon>{user.userName}</InputGroup.Addon>
                            <FormControl type="text" name="message"
                                         value={message}
                                         onChange={this.handleMessageChange}/>
                            <InputGroup.Button>
                                <Button bsStyle="primary" type="submit"
                                        disabled={!canISendMessage}>
                                    {sendButtonText}
                                </Button>
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
        user: state.user,
        history: state.chat.history,
        message: state.chat.message,
        canISendMessage: state.chat.canISendMessage,
        sendMessageCountdown: state.chat.sendMessageCountdown,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        handleGetDataFromServer: data => dispatch(getDataFromServer(data)),
        handleAddPostToHistory: data => dispatch(addPostToHistory(data)),
        handleClearHistory: () => dispatch(clearHistory()),

        handleSetMessage: data => dispatch(setMessage(data)),
        handleSetCanISendMessage: data => dispatch(setCanISendMessage(data)),
        handleSetSendMessageCountdown: data => dispatch(setSendMessageCountdown(data)),

        handleSetIsLoggedIn: bool => dispatch(setIsLoggedIn(bool)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatView);