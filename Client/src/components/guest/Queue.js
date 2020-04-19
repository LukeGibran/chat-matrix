import React from 'react';
import PropTypes from 'prop-types';
import SelfVideo from '../common/SelfVideo';

function Queue(props) {
    const {
        userID,
        vip,
        stream,
        users,
        onExit
    } = props;

    const name = (vip !== null ? `${vip.fullname} (@${vip.username})` : '[VIP]');
    const me = users.find(user => user.userId === userID);
    const number = users.indexOf(me) + 1;

    return (
        <div className="text-center px-3 px-md-5">
            <div className="pt-4 pb-3">
                <p className="m-0 pb-1">
                    <small>This is how you will look during the video call:</small>
                </p>

                <SelfVideo stream={stream} />
            </div>

            <div>You are number</div>
            <div className="text-success">{number}</div>
            <div>in the queue</div>

            <div className="my-3">
                <small>
                    The lower your number, the closer you are getting to being greeted by {name} via a video call.
                    Please use <b>headphones</b> to prevent echoing during the video call.
                    Don't go anywhere! But if you must exit the queue,
                    please press <a href="/chat" onClick={onExit}>here</a>.
                    Payment is not taken from your card before your video call begins.
                </small>
            </div>
        </div>
    );
}

Queue.propTypes = {
    userID: PropTypes.string,
    vip: PropTypes.object,
    users: PropTypes.array,
    stream: PropTypes.object,
    onExit: PropTypes.func
};

export default Queue;
