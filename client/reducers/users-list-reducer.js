import * as TYPES from '../actions/types';

const initialState = {
    onlineUsersList: [],
    bannedUsersList: [],
    allUsersList: []
};

export default function (state = initialState, action) {
    const {type, data} = action;

    switch (type) {
        case TYPES.USERSLIST_SET_ONLINE_USERS_LIST:
            return {
                ...state,
                onlineUsersList: data
            };

        case TYPES.USERSLIST_SET_BANNED_USERS_LIST:
            return {
                ...state,
                bannedUsersList: data
            };

        case TYPES.USERSLIST_SET_ALL_USERS_LIST:
            return {
                ...state,
                allUsersList: data
            };

        case TYPES.USERSLIST_CLEAR_LIST:
            return {
                ...state,
                onlineUsersList: [],
                bannedUsersList: [],
                allUsersList: []
            };

        default:
            return state;
    }
}