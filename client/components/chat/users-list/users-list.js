import React, {Component} from 'react';
import cn from 'classnames';

import Col from "react-bootstrap/es/Col";
import Glyphicon from "react-bootstrap/es/Glyphicon";

class UsersListView extends Component {

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
                    const {userName, isMuted, isBanned, color} = user;
                    const userStyle = {color};

                    return (
                        <div className={cn("chat-view__users-list--user",
                            {"chat-view__users-list--user-editable": isAdmin})}
                             key={`${text}-user-${index}`}
                             style={userStyle}>
                            <Glyphicon className={cn("chat-view__users-list--user-glyph",
                                {"chat-view__users-list--user-glyph-muted": isMuted})}
                                       glyph={isMuted ? "volume-off" : "volume-down"}
                                       onClick={handleSetIsMuted.bind(this, index)}/>
                            <Glyphicon className={cn("chat-view__users-list--user-glyph",
                                {"chat-view__users-list--user-glyph-banned": isBanned})}
                                       glyph={isBanned ? "remove" : "ok"}
                                       onClick={handleSetIsBanned.bind(this, index)}/>
                            <span className="chat-view__users-list--user-name">{userName}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    render() {
        return (
            <Col xs={3} className="chat-view__users-list">
                <p className="chat-view__users-list--title">Online users:</p>
                {this.renderUsersList(true)}

                <p className="chat-view__users-list--title">Banned users:</p>
                {this.renderUsersList(false)}
            </Col>
        );
    }
}

export default UsersListView;