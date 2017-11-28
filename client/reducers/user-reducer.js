import * as TYPES from '../actions/types';

const initialState = {
    userName: 'user',
    password: 'password',
    token: '',

    isAdmin: false,
    isBanned: false,
    isMuted: false,
    color: 'black',

    isLoggedIn: false,

    auth: 'ok'
};

export default function (state = initialState, action) {
    const {type, data} = action;

    switch (type) {
        case TYPES.USER_SET_AUTH:
            return {
                ...state,
                auth: data
            };

        case TYPES.USER_SET_IS_LOGGED_IN:
            return {
                ...state,
                isLoggedIn: data
            };

        case TYPES.USER_SET_USERNAME:
            return {
                ...state,
                userName: data
            };

        case TYPES.USER_SET_PASSWORD:
            return {
                ...state,
                password: data
            };

        case TYPES.USER_SET_TOKEN:
            return {
                ...state,
                token: data
            };

        case TYPES.USER_SET_IS_MUTED:
            return {
                ...state,
                isMuted: data
            };

        case TYPES.USER_SET_IS_BANNED:
            return {
                ...state,
                isBanned: data
            };

        case TYPES.CHAT_SET_USER_INFO:
            return {
                ...state,
                userName: data.userName,
                password: data.password,
                token: data.token,

                isAdmin: data.isAdmin,
                isBanned: data.isBanned,
                isMuted: data.isMuted,
                color: data.color,
            };

        default:
            return state;
    }
}