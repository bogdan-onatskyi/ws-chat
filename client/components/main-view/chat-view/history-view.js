import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

const addZero = (num, digit = 2) => {
    let retStr = '';

    for (let i = digit - 1; i > 0; i--) {
        if (num < Math.pow(10, i)) retStr += 0;
    }

    return retStr + num.toString();
};

class HistoryView extends Component {
    static PropTypes = {
        history: PropTypes.array.isRequired,
    };

    render = () => {
        const {history} = this.props;

        return (
            <div className="chat-view__chat--history">
                {history.map((post, index) => {
                    const {type, timeStamp, userName, color, message} = post;
                    const msgStyle = {color};

                    const date = new Date(timeStamp);
                    const dateStr =
                        `${addZero(date.getDate())}.${addZero(date.getMonth())}.${date.getFullYear()} \
                        ${addZero(date.getHours())}:${addZero(date.getMinutes())}:${addZero(date.getSeconds())}`;

                    const isUserMessage = type === 'responseNewMessage';

                    return (
                        <div className="chat-view__chat--history--text" key={`post_${index}`}>
                            <span className="chat-view__chat--history--text-timestamp">{dateStr}</span>
                            <span className="chat-view__chat--history--text-message" style={msgStyle}>
                                {isUserMessage &&
                                    <span>
                                        <span className="chat-view__chat--history--text-message--username">{userName}:</span>
                                        <span className="chat-view__chat--history--text-message--user-message">{message}</span>
                                    </span>
                                }
                                {!isUserMessage &&
                                    <span className="chat-view__chat--history--text-message--server-message">{message}</span>
                                }
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };
}

function mapStateToProps(state) {
    return {
        history: state.chat.history
    };
}

function mapDispatchToProps(dispatch) {
    return {
        // setPassword: password => dispatch(setPassword(password)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(HistoryView);
