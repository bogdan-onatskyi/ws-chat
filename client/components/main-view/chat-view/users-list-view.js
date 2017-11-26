import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'classnames';

import Col from "react-bootstrap/es/Col";
import Glyphicon from "react-bootstrap/es/Glyphicon";

// import './users-list-view.scss';

class UsersListView extends Component {
    static PropTypes = {
        isAdmin: PropTypes.bool.isRequired,
        usersList: PropTypes.array.isRequired,

        setIsMuted: PropTypes.func.isRequired,
        setI: PropTypes.func.isRequired,
    };

    handleIsMuted = (index) => {
        if (this.props.isAdmin) {
            const {usersList, setIsMuted} = this.props;
            const {userName, isMuted} = usersList[index];

            setIsMuted(userName, !isMuted);

            console.log(`isMuted = ${usersList[index].isMuted}, index = ${index}`);
        }
    };

    handleIsBanned = (index) => {
        if (this.props.isAdmin) {
            const {usersList, setIsBanned} = this.props;
            const {userName, isBanned} = usersList[index];

            setIsBanned(userName, !isBanned);

            console.log(`isBanned = ${usersList[index].isBanned}, index = ${index}`);
        }
    };

    render() {
        const {isAdmin, usersList} = this.props;

        return (
            <Col xs={3} className="chat-view__users-list">
                <h4><strong>Online users:</strong></h4>

                {usersList.map((user, index) => {
                    const {userName, isMuted, isBanned} = user;
                    return (
                        <div key={`user-${index}`}
                             className={cn("chat-view__users-list--user",
                                 {"chat-view__users-list--user-editable": isAdmin})}>
                            <div className={cn("chat-view__users-list--user",
                                {"chat-view__users-list--user-editable": isAdmin})}>

                                {isAdmin && <Glyphicon className={cn("post", {"post__isMuted": isMuted})}
                                                       glyph={isMuted ? "volume-off" : "volume-down"}
                                                       onClick={this.handleIsMuted.bind(this, index)}/>}

                                {isAdmin && <Glyphicon className={cn("post", {"post__isBanned": isBanned})}
                                                       glyph={isBanned ? "remove" : "ok"}
                                                       onClick={this.handleIsBanned.bind(this, index)}/>}

                                {userName}
                            </div>
                        </div>
                    );
                })}
            </Col>
        );
    };
}

function mapStateToProps(state) {
    return {
        usersList: state.usersList.usersList,
    };
}

// function mapDispatchToProps(dispatch) {
//     return {
//         // setUsersList: data => dispatch(setUsersList(data)),
//         // clearUsersList: data => dispatch(clearUsersList(data)),
//     };
// }

export default connect(mapStateToProps)(UsersListView);
// export default connect(mapStateToProps, mapDispatchToProps)(UsersListView);