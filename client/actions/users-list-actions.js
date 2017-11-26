import * as TYPES from './types';

export function setUsersList(data) {
    return {
        type: TYPES.USERSLIST_SET_LIST,
        data
    };
}

export function clearUsersList(data) {
    return {
        type: TYPES.USERSLIST_CLEAR_LIST,
        data
    };
}