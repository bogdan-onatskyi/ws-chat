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

export function setToken(data) {
    return {
        type: TYPES.USER_SET_TOKEN,
        data
    };
}

export function setIsMuted(data) {
    return {
        type: TYPES.USER_SET_IS_MUTED,
        data
    };
}

export function setIsBanned(data) {
    return {
        type: TYPES.USER_SET_IS_BANNED,
        data
    };
}
