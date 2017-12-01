import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import UsersListView from './users-list';

UsersListView.PropTypes = {
    isAdmin: PropTypes.bool.isRequired,

    onlineUsersList: PropTypes.array.isRequired,
    bannedUsersList: PropTypes.array.isRequired,

    handleIsMuted: PropTypes.func.isRequired,
    handleIsBanned: PropTypes.func.isRequired,
};


function mapStateToProps(state) {
    return {
        onlineUsersList: state.usersList.onlineUsersList,
        bannedUsersList: state.usersList.bannedUsersList,
    };
}

export default connect(mapStateToProps)(UsersListView);