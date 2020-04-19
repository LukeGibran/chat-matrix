import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UserGrid from './UserGrid';
import Axios from 'axios';
import utils from '../common/utils';

class Users extends Component {
    constructor(props) {
        super(props);

        this.state = {
            users: [],
            page: 0
        };

        this._isMounted = false;
        this._isEventsAdded = false;
        this._pollInterval = null;
    }

    componentDidMount() {
        this._isMounted = true;
        let isGetting = false;

        this._pollInterval = setInterval(() => {
            if (isGetting) {
                return;
            }

            isGetting = true;

            Axios.get(`${utils.serverURL}/c/chat/users`)
                .then(response => {
                    if (!this._isMounted) {
                        return;
                    }

                    this.setState({ users: response.data });
                })
                .catch(error => console.log(error))
                .finally(() => {
                    isGetting = false;
                });
        }, 1000);

        this.addIOEvents();// attempt to add Socket.IO events
    }

    componentDidUpdate() {
        this.addIOEvents();
    }

    componentWillUnmount() {
        this._isMounted = false;
        const { io } = this.props;

        if (io) {
            io.off('USERS_LOADED');
            io.off('USERS_UPDATED');
            io.off('UPDATE_BUSY_STATUS');
            io.off('UPDATE_AVATAR');
        }

        clearInterval(this._pollInterval);

        this._isEventsAdded = false;
        this._pollInterval = null;
    }

    addIOEvents() {
        if (this._isEventsAdded) {
            return;
        }

        const { io } = this.props;

        if (io) {
            clearInterval(this._pollInterval);

            this._isEventsAdded = true;
            this._pollInterval = null;

            io.on('USERS_LOADED', users => this.setState({ users: users }));
            io.on('USERS_UPDATED', () => io.emit('LOAD_USERS'));
            io.on('UPDATE_BUSY_STATUS', () => io.emit('LOAD_USERS'));
            io.on('UPDATE_AVATAR', () => io.emit('LOAD_USERS'));

            io.emit('LOAD_USERS');
        }
    }

    handleSelect = (user) => {
        if (!this.props.io) {
            return;
        }

        this.props.onSelect(user);
    }

    handleReport = (user) => {
        this.props.io.emit('REPORT_USER', user);
    }

    handleNextPage = (numPages) => {
        const page = this.state.page;

        if (page < numPages - 1) {
            this.setState({ page: page + 1 });
        }
    }

    handlePrevPage = () => {
        const page = this.state.page;

        if (page > 0) {
            this.setState({ page: page - 1 });
        }
    }

    render() {
        const {
            users,
            page
        } = this.state;

        const {
            guestID,
            guestIP,
            windowWidth,
            windowHeight
        } = this.props;

        let _users = typeof users === 'object' ? users : [];

        return (
            <UserGrid users={_users} page={page}
                guestID={guestID} guestIP={guestIP}
                windowWidth={windowWidth} windowHeight={windowHeight}
                onSelect={this.handleSelect} onReport={this.handleReport}
                onNextPage={this.handleNextPage} onPrevPage={this.handlePrevPage} />
        );
    }
}

Users.propTypes = {
    io: PropTypes.object,
    guestID: PropTypes.string,
    guestIP: PropTypes.string,
    windowWidth: PropTypes.number,
    windowHeight: PropTypes.number,
    onSelect: PropTypes.func
};

export default Users;
