import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'classnames';

import Col from "react-bootstrap/es/Col";
import Glyphicon from "react-bootstrap/es/Glyphicon";

// import './users-list-view.scss';

class UsersListView extends Component {
    static PropTypes = {
        isAdmin: PropTypes.bool.isRequired,

        onlineUsersList: PropTypes.array.isRequired,
        bannedUsersList: PropTypes.array.isRequired,

        handleIsMuted: PropTypes.func.isRequired,
        handleIsBanned: PropTypes.func.isRequired,
    };

    setIsMuted = (onlineIndex, bannedIndex) => {
        if (this.props.isAdmin) {
            const {onlineUsersList, bannedUsersList, handleIsMuted} = this.props;

            const {userName, isAdmin, isMuted} =
                onlineIndex === null
                    ? bannedUsersList[bannedIndex]
                    : onlineUsersList[onlineIndex];

            if (!isAdmin) handleIsMuted(userName, !isMuted);
        }
    };

    setIsBanned = (onlineIndex, bannedIndex) => {
        if (this.props.isAdmin) {
            const {onlineUsersList, bannedUsersList, handleIsBanned} = this.props;

            const {userName, isAdmin, isBanned} =
                onlineIndex === null
                    ? bannedUsersList[bannedIndex]
                    : onlineUsersList[onlineIndex];

            if (!isAdmin) handleIsBanned(userName, !isBanned);
        }
    };

    renderUsersList = isOnline => {

        const text = isOnline ? "Online" : "Banned";
        const {isAdmin, onlineUsersList, bannedUsersList} = this.props;
        const usersList = isOnline ? onlineUsersList : bannedUsersList;

        const handleSetIsMuted = index => {
            isOnline
                ? this.setIsMuted(index, null)
                : this.setIsMuted(null, index);
        };

        const handleSetIsBanned = index => {
            isOnline
                ? this.setIsBanned(index, null)
                : this.setIsBanned(null, index);
        };

        return (
            <div>
                {usersList.map((user, index) => {
                    const {userName, isMuted, isBanned} = user;
                    return (
                        <div key={`${text}-user-${index}`}
                             className={cn("chat-view__users-list--user",
                                 {"chat-view__users-list--user-editable": isAdmin})}>
                            <div className={cn("chat-view__users-list--user",
                                {"chat-view__users-list--user-editable": isAdmin})}>

                                <Glyphicon className={cn("post", {"post__isMuted": isMuted})}
                                           glyph={isMuted ? "volume-off" : "volume-down"}
                                           onClick={handleSetIsMuted.bind(this, index)}/>
                                <Glyphicon className={cn("post", {"post__isBanned": isBanned})}
                                           glyph={isBanned ? "remove" : "ok"}
                                           onClick={handleSetIsBanned.bind(this, index)}/>
                                {userName}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    render() {
        return (
            <Col xs={3} className="chat-view__users-list">
                <h4><strong>Online users:</strong></h4>
                {this.renderUsersList(true)}

                <h4><strong>Banned users:</strong></h4>
                {this.renderUsersList(false)}
            </Col>
        );
    }
}

function mapStateToProps(state) {
    return {
        onlineUsersList: state.usersList.onlineUsersList,
        bannedUsersList: state.usersList.bannedUsersList,
    };
}

// function mapDispatchToProps(dispatch) {
//     return {
//         setIsMuted: bool => dispatch(setIsMuted(bool)),
//         setIsBanned: bool => dispatch(setIsBanned(bool)),
//     };
// }

export default connect(mapStateToProps)(UsersListView);
// export default connect(mapStateToProps, mapDispatchToProps)(UsersListView);