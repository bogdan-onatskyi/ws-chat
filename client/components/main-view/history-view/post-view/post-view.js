import React, {Component} from 'react';
import PropTypes from 'prop-types';

import './post-view.scss';

class PostView extends Component {
    static PropTypes = {
        timeStamp: PropTypes.string.isRequired,
        userName: PropTypes.string.isRequired,
        isAdmin: PropTypes.bool.isRequired,
        isBanned: PropTypes.bool.isRequired,
        isMuted: PropTypes.bool.isRequired,
        color: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
    };

    render() {
        const {timeStamp, userName, isAdmin, isBanned, isMuted, color, message} = this.props;

        return (
            <div>
                <span className="post post__timeStamp">{timeStamp}</span>
                <span className="post post__userName">{userName}</span>
                <span className="post post__isAdmin">{isAdmin}</span>
                <span className="post post__isBanned">{isBanned}</span>
                <span className="post post__isMuted">{isMuted}</span>
                <span className="post post__message">{message}</span>
            </div>
        );
    }
}

export default PostView;