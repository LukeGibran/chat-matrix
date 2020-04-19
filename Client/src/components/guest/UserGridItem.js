import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import boxBgImage from '../../images/box.jpg';
import reportImage from '../../images/button-report.png';
import utils from '../common/utils';

const busyRootStyle = {
    top: 0,
    left: 0
};

const reportStyle = {
    position: 'absolute',
    width: '1.5em',
    height: '1.5em',
    right: '0.8em',
    bottom: '0.75em',
    opacity: 0.5,
    cursor: 'pointer'
};

function vipPopover(user) {
    return (
        <Popover id={user.userId} className="p-0">
            <img
                src={user.profilePicture}
                alt=""
                crossOrigin="anonymous"
                width={240}
                height={240} />

            <div className="mx-2 my-1 text-center">
                <strong>{user.fullname}</strong><br />
                <strong>(@{user.username})</strong><br />
                {user.followedBy} followers
            </div>
        </Popover>
    );
}

class UserGridItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoadingAvatar: true
        };

        this.root = React.createRef();
        this.avatarImage = React.createRef();
    }

    componentDidMount() {
        const {
            guestID,
            user
        } = this.props;

        const root = this.root.current;
        const img = this.avatarImage.current;
          

        if (img !== null) {
            var avatarURL = `${utils.serverURL}/profile/${user.avatarId}`;

            img.src = avatarURL;

            img.onload = () => {
                img.onload = null;
                img.onerror = null;

                this.setState({ isLoadingAvatar: false });
            };

            img.onerror = error => {
                img.onload = null;
                img.onerror = null;
                img.src = boxBgImage;

                this.setState({ isLoadingAvatar: false });
            };
        }

        if (root !== null && user.userId !== guestID && user.username !== 'DUMMY') {
            root.addEventListener('click', this.handleClick);
        }
    }

    componentWillUnmount() {
        const root = this.root.current;

        if (root !== null) {
            root.removeEventListener('click', this.handleClick);
        }
    }

    handleClick = event => {
        const user = this.props.user;
        const id = event.target.id;

        if (id === 'report') {
            this.props.onReport(user);
        }
        else {
            if (user.isBusy) {
                return;
            }

            this.props.onSelect(user);
        }
    }

    render() {
        const {
            guestID,
            guestIP,
            user,
            width,
            height,
            column,
            row
        } = this.props;

        const {
            isLoadingAvatar
        } = this.state;

        const isMe = (guestID === user.userId);
        const isDummy = (user.username === 'DUMMY');

        const rootStyle = {
            position: 'absolute',
            width: width,
            height: height,
            top: height * row,
            left: width * column,
            cursor: ((isDummy || isMe) ? 'auto' : 'pointer')
        };

        const avatarRootStyle = {
            position: 'absolute',
            width: width,
            height: height,
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            float: 'left'
        };

        const avatarImageStyle = {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            opacity: (isLoadingAvatar ? 0 : 1)
            //backgroundColor: '#dee3e7'
        };

        let avatarImgClassName = (user.isVip ? "img-thumbnail w-100 h-100 bg-primary anim" : "img-thumbnail w-100 h-100 anim");

        return (
            <div ref={this.root} style={rootStyle}>
                <img
                    src={boxBgImage}
                    loading="lazy"
                    crossOrigin="anonymous"
                    alt=""
                    className="img-thumbnail w-100 h-100 animroot" />

                {!isDummy && (
                    <img
                        ref={this.avatarImage}
                        crossOrigin="anonymous"
                        loading="lazy"
                        alt=""
                        className={avatarImgClassName}
                        style={avatarImageStyle} />
                )}

                {isDummy === false && user.isVip && !utils.isMobile && (
                    <OverlayTrigger trigger="hover" placement="auto" overlay={vipPopover(user)}>
                        <div style={avatarRootStyle} />
                    </OverlayTrigger>
                )}

                {isDummy === false && isMe === false && user.isVip === false && user.isBusy && (
                    <div style={busyRootStyle}
                        className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center">
                        <h2 className="text-danger mb-0">BUSY</h2>
                    </div>
                )}

                {isDummy === false && isMe === false && user.isVip === false && guestIP !== user.IP && (
                    <img
                        id="report"
                        alt=""
                        src={reportImage}
                        style={reportStyle} />
                )}
            </div>
        );
    }
}

UserGridItem.propTypes = {
    guestID: PropTypes.string,
    guestIP: PropTypes.string,
    user: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number,
    row: PropTypes.number,
    column: PropTypes.number,
    onReport: PropTypes.func,
    onSelect: PropTypes.func
};

export default UserGridItem;
