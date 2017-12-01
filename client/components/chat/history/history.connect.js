import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import HistoryView from './history';

HistoryView.PropTypes = {
    history: PropTypes.array.isRequired,
};

function mapStateToProps(state) {
    return {
        history: state.chat.history
    };
}

export default connect(mapStateToProps)(HistoryView);
