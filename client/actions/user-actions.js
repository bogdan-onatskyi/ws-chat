import * as TYPES from './types';

export function _setAuth(data) {
    return {
        type: TYPES.USER_SET_AUTH,
        data
    };
}

export function _setIsLoggedIn(data) {
    return {
        type: TYPES.USER_SET_IS_LOGGED_IN,
        data
    };
}

export function _setUserName(data) {
    return {
        type: TYPES.USER_SET_USERNAME,
        data
    };
}

export function _setPassword(data) {
    return {
        type: TYPES.USER_SET_PASSWORD,
        data
    };
}

export function _setToken(data) {
    return {
        type: TYPES.USER_SET_TOKEN,
        data
    };
}

export function _setIsMuted(data) {
    return {
        type: TYPES.USER_SET_IS_MUTED,
        data
    };
}

export function _setIsBanned(data) {
    return {
        type: TYPES.USER_SET_IS_BANNED,
        data
    };
}
