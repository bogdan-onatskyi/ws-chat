import * as TYPES from './types';

export function _setUserInfo(data) {
    return {
        type: TYPES.CHAT_SET_USER_INFO,
        data
    };
}

export function _addPostToHistory(data) {
    return {
        type: TYPES.CHAT_ADD_POST_TO_HISTORY,
        data
    };
}

export function _clearHistory() {
    return {
        type: TYPES.CHAT_CLEAR_HISTORY,
    };
}

export function _setMessage(data) {
    return {
        type: TYPES.CHAT_SET_MESSAGE,
        data
    };
}

export function _setCanISendMessage(data) {
    return {
        type: TYPES.CHAT_SET_CAN_I_SEND_MESSAGE,
        data
    };
}

export function _setSendMessageCountdown(data) {
    return {
        type: TYPES.CHAT_SET_SEND_MESSAGE_COUNTDOWN,
        data
    };
}
