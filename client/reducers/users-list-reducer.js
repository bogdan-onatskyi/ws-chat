import * as TYPES from '../actions/types';

const initialState = {
    usersList: [],

    onlineUsersList: [],
    bannedUsersList: []
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
                onlineUsersList: data
            };

        case TYPES.USERSLIST_SET_BANNED_LIST:
            return {
                ...state,
                bannedUsersList: data
            };

        case TYPES.USERSLIST_CLEAR_LIST:
            return {
                ...state,
                usersList: [],
                onlineUsersList: [],
                bannedUsersList: []
            };

        default:
            return state;
    }
}