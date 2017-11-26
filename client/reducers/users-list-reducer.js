import * as TYPES from '../actions/types';

const initialState = {
    usersList: []
};

export default function (state = initialState, action) {
    const {type, data} = action;

    switch (type) {
        case TYPES.USERSLIST_SET_LIST:
            return {
                ...state,
                usersList: data
            };

        case TYPES.USERSLIST_CLEAR_LIST:
            return {
                ...state,
                usersList: []
            };

        default:
            return state;
    }
}