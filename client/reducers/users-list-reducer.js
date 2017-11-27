import * as TYPES from '../actions/types';

const initialState = {
    usersList: [],

    online: [],
    banned: []
};

export default function (state = initialState, action) {
    const {type, data} = action;

    switch (type) {
        case TYPES.USERSLIST_SET_LIST:
            return {
                ...state,
                usersList: data
            };

        case TYPES.USERSLIST_SET_ONLINE_LIST:
            return {
                ...state,
                online: data
            };

        case TYPES.USERSLIST_SET_BANNED_LIST:
            return {
                ...state,
                banned: data
            };

        case TYPES.USERSLIST_CLEAR_LIST:
            return {
                ...state,
                usersList: [],
                online: [],
                banned: []
            };

        default:
            return state;
    }
}