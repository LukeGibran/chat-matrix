var eventSource = require('../event-source');
var Cell = require('./components/cell');

var CELL_BASE_WIDTH = 200;
var CELL_BASE_HEIGHT = 150;
var MAX_COLUMNS = 3;
var SCROLL_DURATION = 200;

var _userId;
var _userIp;
var _cells = [];
var _users;

var _hammer;
var _gridWidth = 0;
var _gridHeight = 0;
var _cellMinPositionY = 0;
var _cellMaxPositionY = 0;
var _numPages = 0;
var _currentPage = 1;
var _isScrolling = false;

/**
 * 
 * *** ISSUES ***
 * * Too many renderers are created
 * * Avatars flicker when grid is updated
 * * Optimize scrolling
 * * Optimize creation of renderers
 * 
 */

var _gridView_ = {
    add: function (userId, userIp) {
        _userId = userId;
        _userIp = userIp;

        eventSource.on(eventSource.GOT_USERS, _onGotUsers);
        eventSource.on(eventSource.UPDATE_BUSY_STATUS, _onUpdateBusy);
        eventSource.on(eventSource.UPDATE_AVATAR, _onUpdateAvatar);
        $(window).on('resize', _onWindowResize);

        createCellContainer();
        createNavBarAndFooter();
        style();
        setupPageNavigation();
        createCells();
        render();
    },

    remove: function () {
        eventSource.off(eventSource.GOT_USERS, _onGotUsers);
        eventSource.off(eventSource.UPDATE_BUSY_STATUS, _onUpdateBusy);
        eventSource.off(eventSource.UPDATE_AVATAR, _onUpdateAvatar);
        $(window).off('resize', _onWindowResize);

        _userId = null;
        _userIp = null;

        var root = $('#root');

        for (var i = 0, len = _cells.length; i < len; i++) {
            var cell = _cells[i];
            cell.dispose();
        }

        _cells = [];
        var renderers = root.find('#cellContainer').children();

        for (i = 0, len = renderers.length; i < len; i++) {
            var renderer = $(renderers[i]);
            renderer.off();
            renderer.find('#report').off();
            renderer.popover('hide');
            renderer.remove();
        }

        root.find('nav').remove();
        root.find('footer').remove();
        root.find('#cellContainer').remove();
        root.find('#upButton').off('click');
        root.find('#downButton').off('click');
        root.find('#upButton').remove();
        root.find('#downButton').remove();

        _hammer.off('swipe', _onSwipe);
        _hammer = null;
    },

    show: function () {
        var root = $('#root');

        root.find('nav').show();
        root.find('footer').show();
        root.find('#cellContainer').show();
        root.find('#upButton').show();
        root.find('#downButton').show();
    },

    hide: function () {
        var root = $('#root');

        root.find('nav').hide();
        root.find('footer').hide();
        root.find('#cellContainer').hide();
        root.find('#upButton').hide();
        root.find('#downButton').hide();
    }
};

function createCellContainer() {
    var root = $('#root');

    var container = $('<div id="cellContainer" class="position-absolute">');
    root.append(container);
}

function createNavBarAndFooter() {
    var root = $('#root');

    var nav = $('<nav class="navbar navbar-expand-lg navbar-light bg-white fixed-top">');
    root.append(nav);

    var title = $('<div class="position-absolute m-0 text-secondary">').html('THE CHAT MATRIX');
    nav.append(title);

    title.css({
        'font-family': 'Gotham Rounded',
        'font-weight': 'bold',
        'font-style': 'normal',
        'font-size': '2.5em',
        'letter-spacing': '0.6em',
        'padding-left': '0.6em',
        'white-space': 'nowrap',
        'transform-origin': 'top left'
    });

    var footer = $('<footer class="fixed-bottom bg-white text-secondary">');
    root.append(footer);

    var copyright = $('<div>').html('Copyright ©. All rights reserved.');
    footer.append(copyright);

    copyright.css({
        'font-family': 'Gotham Rounded',
        'font-weight': 'bold',
        'font-style': 'normal',
        'white-space': 'nowrap',
        'position': 'absolute',
        'transform-origin': 'top left'
    });

    var upBtn = $('<button id="upButton" class="btn btn-sm btn-primary text-center position-absolute">');
    root.append(upBtn);
    upBtn.append('<span class="oi oi-chevron-top"></span>');
    upBtn.hide();

    var downBtn = $('<button id="downButton" class="btn btn-sm btn-primary text-center position-absolute">');
    root.append(downBtn);
    downBtn.append('<span class="oi oi-chevron-bottom"></span>');
    downBtn.hide();
}

function setupPageNavigation() {
    var root = $('#root');

    _hammer = new Hammer(root.find('#cellContainer').get(0));
    _hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
    _hammer.on('swipe', _onSwipe);

    root.find('#upButton').on('click', prevPage);
    root.find('#downButton').on('click', nextPage);
}

function style() {
    var win = $(window);
    var root = $('#root');
    var nav = $('nav');
    var title = nav.find('div');
    var footer = $('footer');
    var copyright = footer.find('div');
    var cellContainer = root.find('#cellContainer');
    var upBtn = root.find('#upButton');
    var downBtn = root.find('#downButton');

    var isLandscape = win.width() > win.height();
    var parentInnerWidth = root.width();
    var parentWidth = root.outerWidth();
    var parentInnerHeight = root.height();
    var parentHeight = root.outerHeight();

    if (parentInnerWidth === 0) {
        parentInnerWidth = win.width();
    }

    if (parentInnerHeight === 0) {
        parentInnerHeight = win.height();
    }

    var cellWidth = 0;
    var cellHeight = 0;

    if (isLandscape) {
        _gridWidth = parentInnerHeight;
        _gridHeight = _gridWidth * 0.75;
    }
    else {
        _gridWidth = parentInnerWidth;
        cellWidth = _gridWidth / 3;
        cellHeight = cellWidth * 0.75;
        _gridHeight = (Math.round(parentInnerHeight / cellHeight) - 1) * cellHeight;
    }

    ////////////// title
    var navHeight = (parentInnerHeight - _gridHeight) / 2;
    nav.css({
        'padding-top': navHeight,
        'padding-bottom': 0, paddingLeft: 0, paddingRight: 0
    });

    var titleScale = _gridWidth / title.outerWidth();
    title.css({ 'transform': 'scale(' + titleScale + ')' });

    var titleRect = title.get(0).getBoundingClientRect();
    title.css({
        'left': (nav.outerWidth() - titleRect.width) / 2,
        'top': (nav.outerHeight() - titleRect.height) / 2
    });

    ////////////// copyright
    footer.css({ 'padding-top': navHeight });

    var copyrightScale = (titleRect.height / copyright.height()) * 0.5;
    copyright.css({ 'transform': 'scale(' + copyrightScale + ')' });

    var copyrightRect = copyright.get(0).getBoundingClientRect();
    copyright.css({
        'left': (footer.outerWidth() - copyrightRect.width) / 2,
        'top': (footer.outerHeight() - copyrightRect.height) / 2
    });

    ////////////// cell container
    cellContainer.css({
        'width': _gridWidth,
        'height': _gridHeight,
        'top': (parentHeight - _gridHeight) / 2,
        'left': (parentWidth - _gridWidth) / 2
    });

    var containerPosition = cellContainer.position();
    _cellMinPositionY = containerPosition.top;
    _cellMaxPositionY = containerPosition.top + _gridHeight;

    ////////////// buttons
    upBtn.css({
        'width': _gridWidth,
        'height': containerPosition.top,
        'top': 0,
        'left': (parentWidth - _gridWidth) / 2
    });

    downBtn.css({
        'width': _gridWidth,
        'height': containerPosition.top,
        'bottom': 0,
        'left': (parentWidth - _gridWidth) / 2
    });
}

function createCells() {
    var root = $('#root');
    var container = root.find('#cellContainer');

    var cellWidth = _gridWidth / MAX_COLUMNS;
    var cellScale = cellWidth / CELL_BASE_WIDTH;
    var cellHeight = CELL_BASE_HEIGHT * cellScale;
    var rows = Math.round(_gridHeight / cellHeight);
    var cellsInPage = rows * MAX_COLUMNS;

    var col = 0;
    var row = 0;

    for (var i = 0; i < cellsInPage; i++) {
        col = i % MAX_COLUMNS;
        row = Math.floor(i / MAX_COLUMNS);

        var cell = new Cell(container);
        cell.x = cellWidth * col;
        cell.y = cellHeight * row;
        cell.width = cellWidth;
        cell.height = cellHeight;
        cell.scale = cellScale;

        _cells[i] = cell;
    }
}

function render() {
    var root = $('#root');
    var container = root.find('#cellContainer');
    var position = container.position();

    for (var i = 0, len = _cells.length; i < len; i++) {
        var cell = _cells[i];
        var cellGlobalY = cell.y + position.top;

        if (cellGlobalY >= _cellMinPositionY - cell.height && cellGlobalY <= _cellMaxPositionY) {
            if (!cell.renderer) {
                cell.renderer = createRenderer();
            }
            cell.update();
        }
        else {
            cell.renderer = null;
        }
    }
}

function createRenderer() {
    var cell = $('<div data-toggle="popover" data-trigger="manual" data-placement="auto" data-html="true" class="position-absolute">');

    var img = $('<img class="img-thumbnail w-100 h-100" src="../../images/box.jpg" alt="">');
    cell.append(img);

    var busy = $('<div class="position-absolute w-100 h-100 d-flex align-items-center justify-content-center" style="top:0; left:0;">');
    cell.append(busy);

    var h2 = $('<h2 id="busy" class="text-danger mb-0">');
    h2.html('BUSY');
    busy.append(h2);
    h2.hide();

    var report = $('<div id="report" class="position-absolute">');
    cell.append(report);
    report.hide();

    report.hover(
        function () {
            report.css({ 'opacity': 1 });
        },
        function () {
            report.css({ 'opacity': 0.5 });
        }
    );

    report.css({
        'width': '1.5em',
        'height': '1.5em',
        'background': 'url(../../images/button-report.png) no-repeat center 0',
        'background-size': '100%',
        'right': '0.8em',
        'bottom': '0.75em',
        'opacity': '0.5',
        'cursor': 'pointer'
    });

    return cell;
}

function updateButtons() {
    var root = $('#root');
    var nav = root.find('nav');
    var footer = root.find('footer');
    var upBtn = root.find('#upButton');
    var downBtn = root.find('#downButton');

    if (_numPages > 1) {
        if (_currentPage > 1) {
            nav.hide();
            upBtn.show();
        }
        else {
            nav.show();
            upBtn.hide();
        }

        if (_currentPage < _numPages) {
            footer.hide();
            downBtn.show();
        }
        else {
            footer.show();
            downBtn.hide();
        }
    }
}

function nextPage() {
    if (_isScrolling) {
        return;
    }
    _isScrolling = true;

    var container = $('#root').find('#cellContainer');
    var position = container.position();
    _currentPage++;

    updateButtons();
    container.animate(
        { top: position.top - _gridHeight },
        {
            duration: SCROLL_DURATION,
            progress: render,
            complete: function () {
                _isScrolling = false;
            }
        }
    );
}

function prevPage() {
    if (_isScrolling) {
        return;
    }
    _isScrolling = true;

    var container = $('#root').find('#cellContainer');
    var position = container.position();
    _currentPage--;

    updateButtons();
    container.animate(
        { top: position.top + _gridHeight },
        {
            duration: SCROLL_DURATION,
            progress: render,
            complete: function () {
                _isScrolling = false;
            }
        }
    );
}

////////////// EVENTS
/**
 * *** TODO ***
 * * Move users
 * 
 * @param {Array} users 
 */
function _onGotUsers(users) {
    var root = $('#root');
    var container = root.find('#cellContainer');

    var cellWidth = _gridWidth / MAX_COLUMNS;
    var cellScale = cellWidth / CELL_BASE_WIDTH;
    var cellHeight = CELL_BASE_HEIGHT * cellScale;
    var rows = Math.round(_gridHeight / cellHeight);
    var cellsInPage = rows * MAX_COLUMNS;
    _numPages = Math.ceil(users.length / cellsInPage);
    var totalNumCells = _numPages * cellsInPage;
    _currentPage = 1;

    _users = users;// TEMP

    // Find and remove cells with users who are already gone/offline
    _cells.forEach(function (cell) {
        if (!cell.data) {
            return;
        }

        var found = users.find(function (aUser) {
            return cell.data.userId === aUser.userId;;
        });

        if (!found) {
            cell.isDispose = true;
        }
    });

    for (var i = _cells.length - 1; i >= 0; i--) {
        var cell = _cells[i];

        if (cell.isDispose) {
            cell.dispose();
            _cells.splice(i, 1);
        }
    }

    // insert user in the grid
    users.forEach(function (aUser) {
        var foundCell = _cells.find(function (cell) {
            if (cell.data) {
                return cell.data.userId === aUser.userId;
            }

            return false;
        });

        if (!foundCell) {
            var emptyCell = _cells.find(function (cell) {
                return !cell.data;
            });

            if (emptyCell) {
                emptyCell.data = aUser;
                emptyCell.index = users.indexOf(aUser);
                emptyCell.isOwn = (aUser.userId === _userId);
                emptyCell.canReport = !(emptyCell.isOwn || aUser.isVip || _userIp === aUser.IP);
            }
        }
        else {
            foundCell.index = users.indexOf(aUser);
            foundCell.updateBusyStatus(aUser);
            foundCell.updateAvatar(aUser);
        }
    });

    // sort cells ascending by user index
    _cells.sort(function (a, b) {
        if (a.data && b.data) {
            return a.index - b.index;
        }

        return 0;
    });

    // Arrange the cells by column and rows
    var col = 0;
    var row = 0;

    for (var i = 0; i < totalNumCells; i++) {
        col = i % MAX_COLUMNS;
        row = Math.floor(i / MAX_COLUMNS);

        var cell = _cells[i];

        // fill missing cells in the grid
        if (!cell) {
            cell = new Cell(container);
            _cells.push(cell);
        }

        cell.width = cellWidth;
        cell.height = cellHeight;
        cell.scale = cellScale;
        cell.x = cellWidth * col;
        cell.y = cellHeight * row;
    }

    // Remove excess cells
    if (users.length > 0) {
        while (_cells.length > totalNumCells) {
            var index = _cells.length - 1;
            var cell = _cells[index];

            if (cell && !cell.data) {
                cell.dispose();
                _cells.splice(index, 1);
            }
        }
    }

    render();
    updateButtons();
}

function _onUpdateBusy(user) {
    for (var i = 0, len = _cells.length; i < len; i++) {
        var cell = _cells[i];
        var cellData = cell.data;

        if (cellData && cellData.userId === user.userId) {
            cell.updateBusyStatus(user);
            return;
        }
    }
}

function _onUpdateAvatar(user) {
    for (var i = 0, len = _cells.length; i < len; i++) {
        var cell = _cells[i];
        var cellData = cell.data;

        if (cellData && cellData.userId === user.userId) {
            cell.updateAvatar(user);
            return;
        }
    }
}

function _onSwipe(event) {
    if (_numPages <= 1) {
        return;
    }

    if (event.direction === Hammer.DIRECTION_DOWN || event.direction === Hammer.DIRECTION_RIGHT) {
        nextPage();
    }
    else {
        prevPage();
    }
}

/**
 * TEMP functionality, FIX THIS
 */
function _onWindowResize() {
    style();
    // createCells();
    _onGotUsers(_users);
}

module.exports = _gridView_;