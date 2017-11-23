import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import Glyphicon from 'react-bootstrap/es/Glyphicon';

import './history-view.scss';

const addZero = (num, digit = 2) => {
    let retStr = '';

    for (let i = digit - 1; i > 0; i--) {
        if (num < Math.pow(10, i)) retStr += 0;
    }

    return retStr + num.toString();
};

const HistoryView = ({history}) => {
    const UserMsg = ({type, userName, isAdmin, isBanned, isMuted, color}) => {
        return type === 'userMsg'
            ? <span>
                <span className="post post__userName"><strong>{userName}</strong></span>
                {isAdmin && <Glyphicon className={cn("post", {"post__isMuted": isMuted})}
                                       glyph={isMuted ? "remove" : "ok"}/>}
                {isAdmin && <Glyphicon className={cn("post", {"post__isBanned": isBanned})}
                                       glyph={isBanned ? "volume-off" : "volume-down"}/>}
              </span>
            : <span/>
    };

    return (
        <div className="history">
            {history.map((post, index) => {
                const {type, timeStamp, userName, isAdmin, isBanned, isMuted, color, message} = post;
                const date = new Date(timeStamp);
                const dateStr =
                    `${addZero(date.getDate())}.${addZero(date.getMonth())}.${date.getFullYear()} \
                    ${addZero(date.getHours())}:${addZero(date.getMinutes())}:${addZero(date.getSeconds())}`;

                return (
                    <div key={`post_${index}`}>
                        <span className="post post__timeStamp">{dateStr}</span>
                        <UserMsg type={type} userName={userName} isAdmin={isAdmin}
                                 isBanned={isBanned} isMuted={isMuted} color={color}/>
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