import React, {Component} from 'react';
import PropTypes from 'prop-types';

import FormGroup from 'react-bootstrap/es/FormGroup';
import InputGroup from 'react-bootstrap/es/InputGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import Button from 'react-bootstrap/es/Button';

import HistoryView from './history-view';

import './chat-view.scss';

class ChatView extends Component {
    static PropTypes = {
        historyLength: PropTypes.number.isRequired,
        serverURL: PropTypes.string.isRequired,
        userName: PropTypes.string.isRequired,
        handleExitChat: PropTypes.func.isRequired,
    };

    state = {
        userName: this.props.userName,
        message: 'message',

        history: []
    };

    componentDidMount() {
        // todo Открыть соединение
        console.log('Открыть соединение');

        this.socket = new WebSocket(this.props.serverURL);

        this.socket.onopen = (event) => {
            console.log('Соединение установлено.');
            this.parseHistory(event);
        };

        this.socket.onclose = (event) => {
            event.wasClean
                ? console.log('Соединение закрыто чисто.')
                : console.log('Обрыв соединения');
            console.log(`Код: ${event.code} причина: ${event.reason}`);
        };

        this.socket.onmessage = (event) => {
            this.parseHistory(event);
        };

        this.socket.onerror = (error) => {
            console.log("Ошибка " + error.message);
        };
    };

    componentWillUnmount() {
        // todo Закрыть соединение
        console.log('Закрыть соединение');
    };

    parseHistory = (event) => {
        if (!event.data) return;

        // timeStamp, userName, isAdmin, isBanned, isMuted, color, message
        // От сервера: timeStamp, userName, message

        let data;
        try {
            data = JSON.parse(event.data);
        }
        catch (err) {
            console.log(`Ошибка JSON.parse(event.data) = ${err}`);
            return;
        }

        const obj = {
            timeStamp: data.timeStamp,
            userName: data.userName,
            message: data.message,
            isAdmin: false,
            isBanned: false,
            isMuted: false,
            color: 'green',
        };

        const array = this.state.history;
        array.push(obj);

        this.setState({
            ...this.state,
            history: [...array.slice(-this.props.historyLength)]
        });
    };

    handleMessageChange = (e) => {
        this.setState({
            ...this.state,
            message: e.target.value
        });
    };

    handleSendMessage = (e) => {
        e.preventDefault();

        // todo Добавить остальные данные, которые отправляются через websocket
        let obj = {
            userName: this.state.userName,
            message: this.state.message
        };

        this.socket.send(JSON.stringify(obj));
    };

    render() {
        const {serverURL, handleExitChat} = this.props;

        return (
            <div className="chat">

                <p className="chat__addr">{serverURL}</p>

                <form name="chatForm" onSubmit={this.handleSendMessage}>
                    <HistoryView history={this.state.history}/>

                    <FormGroup>
                        <InputGroup>
                            <FormControl type="text" name="message"
                                         value={this.state.message}
                                         onChange={this.handleMessageChange}/>
                            <InputGroup.Button>
                                <Button bsStyle="primary" type="submit">Send...</Button>
                            </InputGroup.Button>
                        </InputGroup>
                    </FormGroup>
                </form>

                <Button bsStyle="primary" onClick={handleExitChat}>Exit...</Button>
            </div>
        );
    };
}

export default ChatView;