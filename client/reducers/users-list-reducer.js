import * as TYPES from '../actions/types';

const initialState = {
    onlineUsersList: [],
    bannedUsersList: []
};

export default function (state = initialState, action) {
    const {type, data} = action;

    switch (type) {
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
                onlineUsersList: [],
                bannedUsersList: []
            };

        default:
            return state;
    }
}