import * as TYPES from './types';

export function setOnlineUsersList(data) {
    return {
        type: TYPES.USERSLIST_SET_ONLINE_LIST,
        data
    };
}

export function setBannedUsersList(data) {
    return {
        type: TYPES.USERSLIST_SET_BANNED_LIST,
        data
    };
}

export function clearUsersList(data) {
    return {
        type: TYPES.USERSLIST_CLEAR_LIST,
        data
    };
}