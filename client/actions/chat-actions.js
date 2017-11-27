import * as TYPES from './types';

export function setUserInfo(data) {
    return {
        type: TYPES.CHAT_SET_USER_INFO,
        data
    };
}

export function addPostToHistory(data) {
    return {
        type: TYPES.CHAT_ADD_POST_TO_HISTORY,
        data
    };
}

export function clearHistory() {
    return {
        type: TYPES.CHAT_CLEAR_HISTORY,
    };
}

export function setMessage(data) {
    return {
        type: TYPES.CHAT_SET_MESSAGE,
        data
    };
}

export function setCanISendMessage(data) {
    return {
        type: TYPES.CHAT_SET_CAN_I_SEND_MESSAGE,
        data
    };
}

export function setSendMessageCountdown(data) {
    return {
        type: TYPES.CHAT_SET_SEND_MESSAGE_COUNTDOWN,
        data
    };
}
