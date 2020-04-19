import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import AppNavbarAndFooter from '../guest/AppNavbarAndFooter';
import UserGridItem from './UserGridItem';
// eslint-disable-next-line
import { TweenMax, CSSPlugin } from 'gsap/TweenMax';
import { Swipeable } from 'react-swipeable';

const MAX_COLUMNS = 3;
const TWEEN_DURATION = 0.25;

class UserGrid extends Component {
    constructor(props) {
        super(props);

        this.grid = React.createRef();
        this.gridHeight = 0;
        this.numPages = 0;
        this.isScroll = false;
        this.isScrolling = false;
    }

    componentDidUpdate(prevProps) {
        if (this.isScrolling || this.isScroll === false) {
            return;
        }

        const grid = this.grid.current;

        if (grid === null) {
            return;
        }

        const multiplier = (prevProps.page < this.props.page ? -1 : 1);
        const scrollY = this.gridHeight * multiplier;

        TweenMax.to(grid, TWEEN_DURATION, {
            y: `+=${scrollY}`,
            onStart: () => {
                this.isScrolling = true;
            },
            onComplete: () => {
                this.isScroll = false;
                this.isScrolling = false;
            }
        });
    }

    handleNextClick = () => {
        if (this.isScrolling) {
            return;
        }

        this.isScroll = true;
        this.props.onNextPage(this.numPages);
    }

    handlePrevClick = () => {
        if (this.isScrolling) {
            return;
        }

        this.isScroll = true;
        this.props.onPrevPage(this.numPages);
    }

    handleSwiped = event => {
        if (this.numPages <= 1) {
            return;
        }

        switch (event.dir) {
            case 'Down':
            case 'Right':
                this.handlePrevClick();
                break;

            default:
                this.handleNextClick();
        }
    }

    render() {
        const {
            users,
            page,
            guestID,
            guestIP,
            windowWidth,
            windowHeight,
            onSelect,
            onReport
        } = this.props;

        if (windowWidth <= 0 || windowHeight <= 0) {
            return null;
        }

        const isLandscape = windowWidth > windowHeight;
        const gridWidth = (isLandscape ? windowHeight : windowWidth);
        const cellWidth = Math.round(gridWidth / MAX_COLUMNS);
        const cellHeight = Math.round(cellWidth * 0.75);
        const gridHeight = (isLandscape ? gridWidth * 0.75 : (Math.round(windowHeight / cellHeight) - 1) * cellHeight);
        const rows = Math.round(gridHeight / cellHeight);
        const pageNumCells = rows * MAX_COLUMNS;
        let numPages = Math.ceil(users.length / pageNumCells);

        if (numPages <= 0) {
            numPages = 1;
        }

        this.gridHeight = gridHeight;
        this.numPages = numPages;

        const numCells = pageNumCells * numPages;
        const numDummyUsers = (numCells - users.length) + MAX_COLUMNS;// add 1 buffer row, that is not visible in the viewport
        const dummyUsers = [];

        for (let i = 0; i < numDummyUsers; i++) {
            const user = {
                userId: ((i + 1) * 1000000000).toString(),
                username: 'DUMMY'
            };

            dummyUsers.push(user);
        }

        let newUsers = users.concat(dummyUsers);
        let showNavbar = true;
        let showFooter = true;

        if (numPages > 1) {
            showFooter = (page === numPages - 1);
            showNavbar = (page < 1 && page <= numPages - 1);
        }

        const gridRootStyle = {
            position: 'absolute',
            top: (windowHeight - gridHeight) / 2,
            left: (windowWidth - gridWidth) / 2,
            width: gridWidth + 1,
            height: gridHeight,
            overflow: 'hidden'
            
        };

        const buttonHeight = (windowHeight - gridHeight) / 2;

        const buttonUpStyle = {
            position: 'absolute',
            top: 0,
            left: gridRootStyle.left,
            width: gridWidth,
            height: buttonHeight,
            outline: 'none'
        };

        const buttonDownStyle = {
            position: 'absolute',
            bottom: 0,
            left: gridRootStyle.left,
            width: gridWidth,
            height: buttonHeight,
            outline: 'none'
        };
        
        return (
            <Fragment>
                <Swipeable onSwiped={this.handleSwiped}>
                    <div style={gridRootStyle}>
                        <div ref={this.grid}>
                            {newUsers.map((user, index) => (
                                <UserGridItem key={user.userId} user={user}
                                    guestID={guestID} guestIP={guestIP}
                                    width={cellWidth} height={cellHeight}
                                    column={index % MAX_COLUMNS} row={Math.floor(index / MAX_COLUMNS)}
                                    onSelect={onSelect} onReport={onReport} />
                            ))}
                        </div>
                    </div>
                </Swipeable>

                <AppNavbarAndFooter showNavbar={showNavbar} showFooter={showFooter}
                    windowWidth={windowWidth} windowHeight={windowHeight} />

                {numPages > 1 && (
                    <Fragment>
                        <Button variant="primary" size="sm"
                            style={buttonUpStyle} className="text-center shadow-none"
                            onClick={this.handlePrevClick}>
                            <span className="oi oi-chevron-top" />
                        </Button>

                        <Button variant="primary" size="sm"
                            style={buttonDownStyle} className="text-center shadow-none"
                            onClick={this.handleNextClick}>
                            <span className="oi oi-chevron-bottom" />
                        </Button>
                    </Fragment>
                )}
            </Fragment>
        );
    }
}

UserGrid.propTypes = {
    users: PropTypes.array,
    guestID: PropTypes.string,
    guestIP: PropTypes.string,
    page: PropTypes.number,
    windowWidth: PropTypes.number,
    windowHeight: PropTypes.number,
    onNextPage: PropTypes.func,
    onPrevPage: PropTypes.func,
    onSelect: PropTypes.func,
    onReport: PropTypes.func
};

export default UserGrid;
