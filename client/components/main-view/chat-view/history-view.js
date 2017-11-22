import React, {Component} from 'react';
import PropTypes from 'prop-types';

import './history-view.scss';

const addZero = (num, digit = 2) => {
    let retStr = '';

    for (let i = digit - 1; i > 0; i--) {
        if (num < Math.pow(10, i)) retStr += 0;
    }

    return retStr + num.toString();
};

const HistoryView = ({history}) => {
    return (
        <div className="history">
            {history.map((post, index) => {
                const {timeStamp, userName, isAdmin, isBanned, isMuted, color, message} = post;
                const date = new Date(timeStamp);
                const dateStr =
                    `${addZero(date.getDate())}.${addZero(date.getMonth())}.${date.getFullYear()} \
                    ${addZero(date.getHours())}:${addZero(date.getMinutes())}:${addZero(date.getSeconds())}`;

                return (
                    <div key={`post_${index}`}>
                        <span className="post post__timeStamp">{dateStr}</span>
                        <span className="post post__userName"><strong>{userName}</strong></span>
                        <span className="post post__isAdmin">{isAdmin}</span>
                        <span className="post post__isBanned">{isBanned}</span>
                        <span className="post post__isMuted">{isMuted}</span>
                        <span className="post post__message">{message}</span>
                    </div>
                );
            })}
        </div>
    );
};
HistoryView.PropTypes = {
    history: PropTypes.array.isRequired,
};

export default HistoryView;