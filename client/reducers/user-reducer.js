import * as TYPES from '../actions/types';

const initialState = {
    userId: null,

    userName: 'user',
    password: 'password',

    isAdmin: false,
    isBanned: false,
    isMuted: false,
    color: 'black',

    isLoggedIn: false,
};

export default function (state = initialState, action) {
    const {type, data} = action;

    switch (type) {
        case TYPES.USER_SET_IS_LOGGED_IN:
            return {
                ...state,
                isLoggedIn: data
            };

        case TYPES.USER_SET_USERNAME:
            console.log(`username = ${data}`);

            return {
                ...state,
                userName: data
                // user: {userName: data}
            };

        case TYPES.USER_SET_PASSWORD:
            return {
                ...state,
                password: data
            };

        case TYPES.CHAT_GET_DATA_FROM_SERVER:
            return {
                ...state,
                ...data
            };

        default:
            return state;
    }
}