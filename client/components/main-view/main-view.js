import React, {Component} from 'react';
import PropTypes from 'prop-types';

import FormGroup from 'react-bootstrap/es/FormGroup';
import InputGroup from 'react-bootstrap/es/InputGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import Button from 'react-bootstrap/es/Button';

// import PropTypes from 'prop-types';

// import {toString} from '../../../utils/utils';

import HistoryView from './history-view/history-view';

import './main-view.scss';

class MainView extends Component {
    static PropTypes = {
        historyLength: PropTypes.number.isRequired
    };

    state = {
        userName: '',
        // userName: 'username',
        password: 'password',
        message: 'message',

        serverURL: 'ws://localhost:8080',

        history: []
    };

    constructor(props) {
        super();

        const {historyLength} = props;

        this.socket = new WebSocket(this.state.serverURL);

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
    }

    parseHistory = (event) => {
        if (!event.data) return;

        console.log(`Получены данные ${event.data}`);

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

            isAdmin: false,
            isBanned: false,
            isMuted: false,
            color: 'green',

            message: data.message
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
        })
    };

    handleSendMessage = (e) => {
        e.preventDefault();

        let obj = {
            userName: this.state.userName,
            message: this.state.message
        };

        if (!this.state.userName) {
            // todo Обработать ввод пароля
            obj.password = prompt('Enter password', 'aa');
        }

        this.socket.send(JSON.stringify(obj));
    };

    render() {
        return (
            <main className="main">
                <h2 className="main__title">List of users:</h2>

                <p>{this.state.serverURL}</p>

                <form name="newMessage" onSubmit={this.handleSendMessage}>
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
            </main>
        );
    };
}

export default MainView;