import * as TYPES from '../actions/types';

const historyLength = 20;

const initialState = {
    history: [],
    message: '',
    canISendMessage: false,
    sendMessageCountdown: 0,
};

export default function (state = initialState, action) {
    const {type, data} = action;

    switch (type) {
        case TYPES.CHAT_ADD_POST_TO_HISTORY:
            return {
                ...state,
                history: [...state.history.splice(-historyLength - 1), data],
                // history: [...state.history.slice(-historyLength - 1), data]
            };

        case TYPES.CHAT_CLEAR_HISTORY:
            return {
                ...state,
                history: []
                // history: [...history.splice(0)]
            };

        case TYPES.CHAT_SET_MESSAGE:
            return data.length > 200
                ? state
                : {...state, message: data};

        case TYPES.CHAT_SET_CAN_I_SEND_MESSAGE:
            return {
                ...state,
                canISendMessage: data
            };

        case TYPES.CHAT_SET_SEND_MESSAGE_COUNTDOWN:
            return {
                ...state,
                sendMessageCountdown: data
            };

        default:
            return state;
    }
}
