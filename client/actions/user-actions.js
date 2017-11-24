import * as TYPES from './types';

export function setIsLoggedIn(data) {
    return {
        type: TYPES.USER_SET_IS_LOGGED_IN,
        data
    };
}

export function setUserName(data) {
    return {
        type: TYPES.USER_SET_USERNAME,
        data
    };
}

export function setPassword(data) {
    return {
        type: TYPES.USER_SET_PASSWORD,
        data
    };
}
