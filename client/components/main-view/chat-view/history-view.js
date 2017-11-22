import React, {Component} from 'react';
import PropTypes from 'prop-types';

import './history-view.scss';

const HistoryView = ({history}) => {
    // if (history.length === 0) return <div/>;
    return (
        <div>
            {history.map((post, index) => {
                const {timeStamp, userName, isAdmin, isBanned, isMuted, color, message} = post;

                return (
                    <div key={`post_${index}`}>
                        <span className="post post__timeStamp">{timeStamp}</span>
                        <span className="post post__userName">{userName}</span>
                        <span className="post post__isAdmin">{isAdmin}</span>
                        <span className="post post__isBanned">{isBanned}</span>
                        <span className="post post__isMuted">{isMuted}</span>
                        <span className="post post__message">{message}</span>
                    </div>
                )
            })}
        </div>
    )
};
HistoryView.PropTypes = {
    history: PropTypes.array.isRequired,
};

export default HistoryView;