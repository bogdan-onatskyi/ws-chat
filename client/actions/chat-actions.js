import * as TYPES from './types';

export function getDataFromServer(data) {
    return {
        type: TYPES.CHAT_GET_DATA_FROM_SERVER,
        data
    };
}

export function addPostToHistory(data) {
    return {
        type: TYPES.CHAT_ADD_POST_TO_HISTORY,
        data
    };
}

export function setMessage(data) {
    return {
        type: TYPES.CHAT_SET_MESSAGE,
        data
    };
}
