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

    timeOut = 10000;

    componentDidMount() {
        const {user, handleGetDataFromServer, handleAddPostToHistory} = this.props;
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
                handleGetDataFromServer(obj.data);
                return;
            }

            handleAddPostToHistory(obj);
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
            userName: this.props.user.userName,
        };
        this.socket.send(JSON.stringify(obj));

        this.props.handleClearHistory();

        console.log('Соединение закрыто.');
    };

    handleMessageChange = (e) => {
        // todo setCanISendMessage
        this.props.handleSetCanISendMessage(e.target.value !== '' && e.target.value.length < 200);
        this.props.handleSetMessage(e.target.value);
    };

    handleSendMessage = (e) => {
        e.preventDefault();

        const {
            user, message, canISendMessage, handleSetCanISendMessage,
            handleSetSendMessageCountdown
        } = this.props;
        const {userName} = user;

        if (canISendMessage) {
            if (message !== '') {
                handleSetCanISendMessage(false);

                const obj = {
                    type: 'userMsg',
                    userName,
                    message
                };

                this.socket.send(JSON.stringify(obj));

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