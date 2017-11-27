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

            const {userName, isMuted} =
                onlineIndex === null
                    ? bannedUsersList[bannedIndex]
                    : onlineUsersList[onlineIndex];

            handleIsMuted(userName, !isMuted);
        }
    };

    setIsBanned = (onlineIndex, bannedIndex) => {
        if (this.props.isAdmin) {
            const {onlineUsersList, bannedUsersList, handleIsBanned} = this.props;

            const {userName, isBanned} =
                onlineIndex === null
                    ? bannedUsersList[bannedIndex]
                    : onlineUsersList[onlineIndex];

            handleIsBanned(userName, !isBanned);
        }
    };

    render() {
        const {isAdmin, onlineUsersList, bannedUsersList} = this.props;

        return (
            <Col xs={3} className="chat-view__users-list">
                <h4><strong>Online users:</strong></h4>

                {onlineUsersList.map((user, index) => {
                    const {userName, isMuted, isBanned} = user;
                    if (!isBanned) {
                        return (
                            <div key={`user-${index}`}
                                 className={cn("chat-view__users-list--user",
                                     {"chat-view__users-list--user-editable": isAdmin})}>
                                <div className={cn("chat-view__users-list--user",
                                    {"chat-view__users-list--user-editable": isAdmin})}>

                                    {isAdmin && <Glyphicon className={cn("post", {"post__isMuted": isMuted})}
                                                           glyph={isMuted ? "volume-off" : "volume-down"}
                                                           onClick={this.setIsMuted.bind(this, index, null)}/>}

                                    {isAdmin && <Glyphicon className={cn("post", {"post__isBanned": isBanned})}
                                                           glyph={isBanned ? "remove" : "ok"}
                                                           onClick={this.setIsBanned.bind(this, index, null)}/>}

                                    {userName}
                                </div>
                            </div>
                        );
                    }
                })}

                <h4><strong>Banned users:</strong></h4>

                {bannedUsersList.map((user, index) => {
                    const {userName, isMuted, isBanned} = user;
                    if (isBanned) {
                        return (
                            <div key={`user-${index}`}
                                 className={cn("chat-view__users-list--user",
                                     {"chat-view__users-list--user-editable": isAdmin})}>
                                <div className={cn("chat-view__users-list--user",
                                    {"chat-view__users-list--user-editable": isAdmin})}>

                                    {isAdmin && <Glyphicon className={cn("post", {"post__isMuted": isMuted})}
                                                           glyph={isMuted ? "volume-off" : "volume-down"}
                                                           onClick={this.setIsMuted.bind(this, null, index)}/>}

                                    {isAdmin && <Glyphicon className={cn("post", {"post__isBanned": isBanned})}
                                                           glyph={isBanned ? "remove" : "ok"}
                                                           onClick={this.setIsBanned.bind(this, null, index)}/>}

                                    {userName}
                                </div>
                            </div>
                        );
                    }
                })}
            </Col>
        );
    };
}

function mapStateToProps(state) {
    return {
        // usersList: state.usersList.usersList,
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