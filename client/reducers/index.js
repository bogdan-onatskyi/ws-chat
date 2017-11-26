import {combineReducers} from 'redux';

import user from './user-reducer';
import chat from './chat-reducer';
import usersList from './users-list-reducer';

export default combineReducers({user, chat, usersList});