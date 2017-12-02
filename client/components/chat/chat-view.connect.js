import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import ChatView from './chat-view';

ChatView.PropTypes = {
    serverURL: PropTypes.string.isRequired,

    user: PropTypes.object.isRequired,
    history: PropTypes.array.isRequired,
    message: PropTypes.string.isRequired,
    canISendMessage: PropTypes.bool.isRequired,
    sendMessageCountdown: PropTypes.number.isRequired,

    onlineUsersList: PropTypes.array.isRequired,
    bannedUsersList: PropTypes.array.isRequired,

    setUserInfo: PropTypes.func.isRequired,
    addPostToHistory: PropTypes.func.isRequired,
    clearHistory: PropTypes.func.isRequired,
    setMessage: PropTypes.func.isRequired,
    setCanISendMessage: PropTypes.func.isRequired,
    setSendMessageCountdown: PropTypes.func.isRequired,

    setOnlineUsersList: PropTypes.func.isRequired,
    setBannedUsersList: PropTypes.func.isRequired,
    setAllUsersList: PropTypes.func.isRequired,
    clearUsersList: PropTypes.func.isRequired,

    setIsLoggedIn: PropTypes.func.isRequired,
    setIsMuted: PropTypes.func.isRequired,
    setIsBanned: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    return {
        user: state.user,
        history: state.chat.history,
        message: state.chat.message,
        canISendMessage: state.chat.canISendMessage,
        sendMessageCountdown: state.chat.sendMessageCountdown,

        onlineUsersList: state.usersList.onlineUsersList,
        bannedUsersList: state.usersList.bannedUsersList,
        allUsersList: state.usersList.allUsersList,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setUserInfo: data => dispatch(require('../../actions/chat-actions')._setUserInfo(data)),

        addPostToHistory: data => dispatch(require('../../actions/chat-actions')._addPostToHistory(data)),
        clearHistory: () => dispatch(require('../../actions/chat-actions')._clearHistory()),
        setMessage: data => dispatch(require('../../actions/chat-actions')._setMessage(data)),
        setCanISendMessage: data => dispatch(require('../../actions/chat-actions')._setCanISendMessage(data)),
        setSendMessageCountdown: data => dispatch(require('../../actions/chat-actions')._setSendMessageCountdown(data)),

        setOnlineUsersList: data => dispatch(require('../../actions/users-list-actions')._setOnlineUsersList(data)),
        setBannedUsersList: data => dispatch(require('../../actions/users-list-actions')._setBannedUsersList(data)),
        setAllUsersList: data => dispatch(require('../../actions/users-list-actions')._setAllUsersList(data)),
        clearUsersList: data => dispatch(require('../../actions/users-list-actions')._clearUsersList(data)),

        setIsLoggedIn: bool => dispatch(require('../../actions/user-actions')._setIsLoggedIn(bool)),
        setIsMuted: bool => dispatch(require('../../actions/user-actions')._setIsMuted(bool)),
        setIsBanned: bool => dispatch(require('../../actions/user-actions')._setIsBanned(bool)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatView);