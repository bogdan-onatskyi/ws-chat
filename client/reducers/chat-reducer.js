import * as TYPES from '../actions/types';

const historyLength = 20;

const initialState = {
    history: [],
    message: '',
};

export default function (state = initialState, action) {
    const {type, data} = action;

    switch (type) {
        case TYPES.CHAT_ADD_POST_TO_HISTORY:
            return {
                ...state,
                history: [...state.slice(-historyLength - 1), data]
            };

        case TYPES.CHAT_SET_MESSAGE:
            return data.length > 200
                ? state
                : {...state, message: data};

        default:
            return state;
    }
}
