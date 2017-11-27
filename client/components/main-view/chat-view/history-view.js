import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'classnames';

import Glyphicon from 'react-bootstrap/es/Glyphicon';

import FormGroup from 'react-bootstrap/es/FormGroup';
import InputGroup from 'react-bootstrap/es/InputGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import Button from 'react-bootstrap/es/Button';

// import {setIsLoggedIn, setUserName, setPassword} from '../../actions/user-actions';

import './history-view.scss';

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
            <div className="history">
                {history.map((post, index) => {
                    const {type, timeStamp, userName, isAdmin, color, message} = post;
                    const date = new Date(timeStamp);
                    const dateStr =
                        `${addZero(date.getDate())}.${addZero(date.getMonth())}.${date.getFullYear()} \
                        ${addZero(date.getHours())}:${addZero(date.getMinutes())}:${addZero(date.getSeconds())}`;

                    return (
                        <div key={`post_${index}`}>
                            <span className="post post__timeStamp">{dateStr}</span>
                            {type === 'responseNewMessage'
                                ? <span>
                                    <span className="post post__userName"><strong><em>{userName}:</em></strong></span>
                                </span>
                                : <span/>
                            }
                            <span className="post post__message">{message}</span>
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
