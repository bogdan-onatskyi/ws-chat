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
        password: PropTypes.string.isRequired,
        handleExitChat: PropTypes.func.isRequired,
    };

    state = {
        userId: null,
        userName: this.props.userName,
        password: this.props.password,
        isAdmin: false,
        isBanned: false,
        isMuted: false,
        color: 'green',

        message: '',

        history: []
    };

    componentDidMount() {
        this.socket = new WebSocket(this.props.serverURL);

        this.socket.onopen = event => {
            console.log('Соединение установлено.');
            // this.parseHistory(event);

            const obj = {
                type: 'initMsg',
                // userId: this.state.userId,
                userName: this.state.userName,
                password: this.state.password,
                // isAdmin: this.state.isAdmin,
                // isBanned: this.state.isBanned,
                // isMuted: this.state.isMuted,
                // color: this.state.color,
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
                obj = JSON.parse(event.data)
            }
            catch (err) {
                console.log(`Ошибка JSON.parse(event.data) = ${err}`);
                return;
            }

            if (obj.type === 'initMsg') {
                this.setState({
                    ...this.state,
                    userName: obj.userName,
                    password: obj.password,
                    isAdmin: obj.isAdmin,
                    isBanned: obj.isBanned,
                    isMuted: obj.isMuted,
                    color: obj.color,
                });
                return;
            }

            const array = this.state.history;
            array.push(obj);

            this.setState({
                ...this.state,
                history: [...array.slice(-this.props.historyLength)]
            });
        };

        this.socket.onclose = (event) => {
            event.wasClean
                ? console.log('Соединение закрыто чисто.')
                : console.log('Обрыв соединения');
            console.log(`Код: ${event.code} причина: ${event.reason}`);
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
        this.setState({
            ...this.state,
            message: e.target.value
        });
    };

    handleSendMessage = (e) => {
        e.preventDefault();

        // todo Добавить остальные данные, которые отправляются через websocket
        const obj = {
            type: 'userMsg',
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

                {this.state.isAdmin ? "true" : "false"}
            </div>
        );
    };
}

export default ChatView;