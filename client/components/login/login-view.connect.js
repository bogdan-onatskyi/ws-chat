import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import LoginView from './login-view';

LoginView.PropTypes = {
    user: PropTypes.object.isRequired,

    setAuth: PropTypes.func.isRequired,
    setIsLoggedIn: PropTypes.func.isRequired,
    setUserName: PropTypes.func.isRequired,
    setPassword: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    return {
        user: state.user
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setAuth: bool => dispatch(require('../../actions/user-actions')._setAuth(bool)),
        setIsLoggedIn: bool => dispatch(require('../../actions/user-actions')._setIsLoggedIn(bool)),
        setUserName: userName => dispatch(require('../../actions/user-actions')._setUserName(userName)),
        setPassword: password => dispatch(require('../../actions/user-actions')._setPassword(password)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginView);