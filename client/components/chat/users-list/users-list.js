import React, {Component} from 'react';
import cn from 'classnames';

import Col from "react-bootstrap/es/Col";
import Glyphicon from "react-bootstrap/es/Glyphicon";

class UsersListView extends Component {

    renderUsersList = listName => {

        const {
            isAdmin, onlineUsersList, bannedUsersList, allUsersList,
            handleIsMuted, handleIsBanned
        } = this.props;

        let usersList;
        if (listName === 'Online') usersList = onlineUsersList;
        if (listName === 'Banned') usersList = bannedUsersList;
        if (listName === 'All') usersList = allUsersList;

        const handler = (listName, action, index) => {

            if (!this.props.isAdmin) return;

            const user = usersList[index];
            const {userName, isAdmin, isMuted, isBanned} = user;

            let actionFunc, actionValue;
            if (action === 'mute') {
                actionFunc = handleIsMuted;
                actionValue = isMuted;
            }
            if (action === 'ban') {
                actionFunc = handleIsBanned;
                actionValue = isBanned;
            }

            if (!isAdmin) actionFunc(userName, !actionValue); // restrict muting/banning Admin
        };

        const countUsers = usersList.length;
        return (
            <div>
                {countUsers !== 0 &&
                    <p className="chat-view__users-list--title">{listName} users({countUsers}):</p>}

                {usersList.map((user, index) => {
                    const {userName, isMuted, isBanned, color} = user;
                    const userStyle = {color};

                    return (
                        <div className={cn("chat-view__users-list--user",
                            {"chat-view__users-list--user-editable": isAdmin})}
                             key={`${listName}-user-${index}`}
                             style={userStyle}>
                            <Glyphicon className={cn("chat-view__users-list--user-glyph",
                                {"chat-view__users-list--user-glyph-muted": isMuted})}
                                       glyph={isMuted ? "volume-off" : "volume-down"}
                                       onClick={handler.bind(this, listName, 'mute', index)}/>
                            <Glyphicon className={cn("chat-view__users-list--user-glyph",
                                {"chat-view__users-list--user-glyph-banned": isBanned})}
                                       glyph={isBanned ? "remove" : "ok"}
                                       onClick={handler.bind(this, listName, 'ban', index)}/>
                            <span className="chat-view__users-list--user-name">{userName}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    render() {
        const {isAdmin} = this.props;
        return (
            <Col xs={3} className="chat-view__users-list">
                {this.renderUsersList('Online')}
                {isAdmin && this.renderUsersList('Banned')}
                {isAdmin && this.renderUsersList('All')}
            </Col>
        );
    }
}

export default UsersListView;