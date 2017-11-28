import * as TYPES from './types';

export function _setOnlineUsersList(data) {
    return {
        type: TYPES.USERSLIST_SET_ONLINE_LIST,
        data
    };
}

export function _setBannedUsersList(data) {
    return {
        type: TYPES.USERSLIST_SET_BANNED_LIST,
        data
    };
}

export function _clearUsersList(data) {
    return {
        type: TYPES.USERSLIST_CLEAR_LIST,
        data
    };
}