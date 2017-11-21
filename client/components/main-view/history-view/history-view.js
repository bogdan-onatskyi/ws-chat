import React, {Component} from 'react';
import PropTypes from 'prop-types';

import PostView from './post-view/post-view';

// import './history-view.scss';

class HistoryView extends Component {
    static PropTypes = {
        history: PropTypes.array.isRequired,
    };

    render() {
        const {history} = this.props;

        return (
            <div>
                {history.map((post, index) => {
                    const {timeStamp, userName, isAdmin, isBanned, isMuted, color, message} = post;

                    return (
                        <PostView key={`post_${index}`}
                                  timeStamp={timeStamp} userName={userName}
                                  isAdmin={isAdmin} isBanned={isBanned}
                                  isMuted={isMuted} color={color}
                                  message={message}/>
                    )
                })}
            </div>
        );
    }
}

export default HistoryView;