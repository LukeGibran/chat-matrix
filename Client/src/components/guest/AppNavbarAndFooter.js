import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Navbar } from 'react-bootstrap';

const MAX_COLUMNS = 3;

function AppNavbarAndFooter(props) {
    const {
        showNavbar,
        showFooter,
        windowWidth,
        windowHeight
    } = props;

    // do not render
    if (windowWidth <= 0 || windowHeight <= 0) {
        return null;
    }

    const isLandscape = windowWidth > windowHeight;
    let gridWidth = 0;
    let gridHeight = 0;

    if (isLandscape) {
        gridWidth = windowHeight;
        gridHeight = gridWidth * 0.75;
    }
    else {
        gridWidth = windowWidth;
        const cellWidth = gridWidth / MAX_COLUMNS;
        const cellHeight = cellWidth * 0.75;
        gridHeight = (Math.round(windowHeight / cellHeight) - 1) * cellHeight;
    }

    const navHeight = (windowHeight - gridHeight) / 2;

    const navStyle = {
        height: navHeight,
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0
    };

    const titleDivWidth = 764;
    const titleDivHeight = 60;
    const titleScale = gridWidth / titleDivWidth;

    const titleRootStyle = {
        height: navHeight,
        width: windowWidth
    };

    const titleStyle = {
        fontFamily: 'Gotham Rounded',
        fontWeight: 'bold',
        fontStyle: 'normal',
        whiteSpace: 'nowrap',
        fontSize: '2.5em',
        letterSpacing: '0.6em',
        paddingLeft: '0.6em',
        transform: `scale(${titleScale})`
    };

    const footerStyle = {
        height: navHeight
    };

    const footerClasses = `d-flex align-items-center justify-content-center fixed-bottom bg-white text-secondary`;

    const copyrightHeight = 24;
    const copyrightScale = ((titleDivHeight * titleScale) / copyrightHeight) * 0.5;

    const copyrightStyle = {
        fontFamily: 'Gotham Rounded',
        fontWeight: 'bold',
        fontStyle: 'normal',
        whiteSpace: 'nowrap',
        transform: `scale(${copyrightScale})`
    };

    return (
        <Fragment>
            {showNavbar &&
                <Navbar expand="lg" bg="white"
                    variant="light" fixed="top"
                    style={navStyle}>
                    <div style={titleRootStyle} className="d-flex align-items-center justify-content-center">
                        <div style={titleStyle} className="m-0 text-secondary">
                            THE CHAT MATRIX
                        </div>
                    </div>
                </Navbar>
            }

            {showFooter &&
                <div style={footerStyle} className={footerClasses}>
                    <div style={copyrightStyle}>
                        Copyright ©. All rights reserved.
                    </div>
                </div>
            }
        </Fragment >
    );
}

AppNavbarAndFooter.propTypes = {
    windowWidth: PropTypes.number,
    windowHeight: PropTypes.number,
    showNavbar: PropTypes.bool,
    showFooter: PropTypes.bool
};

export default AppNavbarAndFooter;
