var Cell = require('../components/cell');

var CELL_WIDTH = 200;
var CELL_HEIGHT = 150;
var COLS = 3;
var SCROLL_DURATION = 200;

var _userId = null;
var _ip = null;
var _view = null;

var _numPages = 0;
var _currentPage = 1;
var _gridWidth = 0;
var _gridHeight = 0;
var _cellMinY = 0;
var _cellMaxY = 0;
var _cellsInPage = 0;

var _isScrolling = false;

var _cells = null;
var _numUsers = 0;
var _pendingUsers = null;

var _grid = null;
// var _rendererPool = [];

module.exports = {
    init: function (userId, view) {
        _userId = userId;
        _view = view;

        var self = this;
        var parent = $('#userGrid');
        var gridParent = parent.find('#gridParent');
        var upBtn = parent.find('#upBtn');
        var downBtn = parent.find('#downBtn');

        _grid = $('<div id="grid" class="position-absolute">');

        upBtn.on('click', prevPage);
        downBtn.on('click', nextPage);

        gridParent.append(_grid);

        var hammertime = new Hammer(gridParent.get(0));
        hammertime.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

        hammertime.on('swipe', function (event) {
            if (event.direction === Hammer.DIRECTION_DOWN || event.direction === Hammer.DIRECTION_RIGHT) {
                nextPage();
            }
            else {
                prevPage();
            }
        });

        function nextPage() {
            if (_isScrolling || _currentPage === _numPages) { return; }
            _isScrolling = true;

            var pos = _grid.position();
            _currentPage++;

            _grid.animate(
                { top: pos.top - _gridHeight },
                {
                    duration: SCROLL_DURATION,
                    progress: self.render,
                    complete: function () {
                        _isScrolling = false;
                    }
                }
            );

            self._updateUI();
        }

        function prevPage() {
            if (_isScrolling || _currentPage === 1) { return; }
            _isScrolling = true;

            var pos = _grid.position();
            _currentPage--;

            _grid.animate(
                { top: pos.top + _gridHeight },
                {
                    duration: SCROLL_DURATION,
                    progress: self.render,
                    complete: function () {
                        _isScrolling = false;
                    }
                }
            );

            self._updateUI();
        }
    },

    layout: function () {
        this.styleNavbarFooter();
        this.update(this._getUsers());
        this.render();

        cleanUpCells();
    },

    styleNavbarFooter: function () {
        var win = $(window);
        var nav = $('nav');
        var footer = $('footer');
        var userGrid = $('#userGrid');
        var title = nav.find('.chat-title');
        var copyright = footer.find('.copyright');
        var gridParent = _grid.parent();
        var upBtn = userGrid.find('#upBtn');
        var downBtn = userGrid.find('#downBtn');

        var isLandscape = win.width() > win.height();

        var cellWidth = 0;
        var cellHeight = 0;

        var gridParentWidth = gridParent.width();
        var gridParentHeight = gridParent.height();

        if (gridParentWidth === 0) {
            gridParentWidth = win.width();
        }

        if (gridParentHeight === 0) {
            gridParentHeight = win.height();
        }

        _gridWidth = 0;
        _gridHeight = 0;

        if (isLandscape) {
            _gridWidth = gridParentHeight;
            _gridHeight = _gridWidth * 0.75;
        }
        else {// Portrait
            _gridWidth = gridParentWidth;

            cellWidth = _gridWidth / 3;
            cellHeight = cellWidth * 0.75;

            // remove 2 rows for navbar and footer
            var rows = Math.round(gridParentHeight / cellHeight) - 1;

            _gridHeight = rows * cellHeight;
        }

        // title
        var navHeight = (gridParentHeight - _gridHeight) / 2;

        nav.css({
            paddingTop: navHeight,
            paddingBottom: 0, paddingLeft: 0, paddingRight: 0
        });

        var titleScale = _gridWidth / title.outerWidth();

        title.css({ transform: 'scale(' + titleScale + ')', top: 0 });

        var titleRect = title.get(0).getBoundingClientRect();

        title.css({
            left: (nav.outerWidth() - titleRect.width) / 2,
            top: (nav.outerHeight() - titleRect.height) / 2
        });

        // copyright
        footer.css({ paddingTop: navHeight });

        var copyrightScale = (titleRect.height / copyright.height()) * 0.5;

        copyright.css({ transform: 'scale(' + copyrightScale + ')' });

        var copyrightRect = copyright.get(0).getBoundingClientRect();

        copyright.css({
            left: (footer.outerWidth() - copyrightRect.width) / 2,
            top: (footer.outerHeight() - copyrightRect.height) / 2
        });

        nav.removeClass('invisible');
        footer.removeClass('invisible');

        // grid
        _grid.css({
            width: _gridWidth, height: _gridHeight,
            top: (gridParentHeight - _gridHeight) / 2,
            left: (gridParentWidth - _gridWidth) / 2
        });

        var gridPos = _grid.position();
        _cellMinY = gridPos.top;
        _cellMaxY = gridPos.top + _gridHeight;

        // buttons
        var topVerticalSpace = gridPos.top;
        var botVerticalSpace = gridParent.height() - (_gridHeight + gridPos.top);

        upBtn.css({
            width: _gridWidth, height: topVerticalSpace,
            left: (userGrid.outerWidth() - _gridWidth) / 2
        });

        downBtn.css({
            width: _gridWidth, height: botVerticalSpace,
            left: upBtn.position().left
        });
    },

    render: function () {
        var gridPos = _grid.position();

        for (var i = 0; i < _cells.length; i++) {
            var cell = _cells[i];
            var cellYGridCoord = cell.y + gridPos.top;

            if (cellYGridCoord >= _cellMinY - cell.height &&
                cellYGridCoord <= _cellMaxY) {

                if (!cell.renderer) {
                    cell.setRenderer(createRenderer());
                }
            }
            else {
                cell.removeRenderer();
            }
        }
    },

    __update: function (users) {
        if (!this._isGridVisible()) {
            _pendingUsers = users;
            return;
        }

        /* if (this._isGridEmpty()) {
            this.initUsers(users);
        }
        else {
            this.updateUsers(users);
        } */

        this._destroyCells();
        this.initUsers(users);
    },

    update: function (users) {
        // console.log('>>>>> update() <<<<<<');
        var cellWidth = _gridWidth / COLS;
        var cellScale = cellWidth / CELL_WIDTH;
        var cellHeight = CELL_HEIGHT * cellScale;
        var rows = Math.round(_gridHeight / cellHeight);

        _cellsInPage = rows * COLS;
        _numUsers = users.length;
        _numPages = Math.ceil(_numUsers / _cellsInPage);

        var totalNumCells = _numPages * _cellsInPage;

        // Find and remove cells with users who are already gone/offline
        _cells.forEach(function (cell) {
            if (!cell.data) {
                return;
            }

            var found = users.find(function (user) {
                return cell.data.userId === user.userId;;
            });

            if (!found) {
                cell.isDestroy = true;
            }
        });

        for (var i = _cells.length - 1; i >= 0; i--) {
            var cell = _cells[i];

            if (cell.isDestroy) {
                cell.destroy();
                _cells.splice(i, 1);
            }
        }

        // insert user in the grid
        users.forEach(function (user) {
            var foundCell = _cells.find(function (cell) {
                if (cell.data) {
                    return cell.data.userId === user.userId;
                }

                return false;
            });

            if (!foundCell) {
                var emptyCell = _cells.find(function (cell) {
                    return !cell.data;
                });

                if (emptyCell) {
                    emptyCell.data = user;
                    emptyCell.isOwn = (user.userId === _userId);
                }
            }
            else {
                foundCell.updateBusyStatus(user);
                foundCell.updateReport();
            }
        });

        // sort cells ascending by user index
        // _cells.sort(function (a, b) {
        //     if (a.data && b.data) {
        //         return a.data.index - b.data.index;
        //     }

        //     return 0;
        // });

        // Arrange the cells by column and rows
        var col = 0;
        var row = 0;

        for (var i = 0; i < totalNumCells; i++) {
            col = i % COLS;
            row = Math.floor(i / COLS);

            var cell = _cells[i];

            // fill missing cells in the grid
            if (!cell) {
                cell = new Cell(this);
                _cells.push(cell);
            }

            cell.width = cellWidth;
            cell.height = cellHeight;
            cell.scale = cellScale;
            cell.x = cellWidth * col;
            cell.y = cellHeight * row;

            cell.update();
        }

        // update UI
        this._updateUI();
        this.render();
    },

    initCells: function () {
        var cellWidth = _gridWidth / COLS;
        var cellScale = cellWidth / CELL_WIDTH;
        var cellHeight = CELL_HEIGHT * cellScale;
        var rows = Math.round(_gridHeight / cellHeight);

        _cellsInPage = rows * COLS;
        _cells = [];

        var col = 0;
        var row = 0;

        for (var i = 0; i < _cellsInPage; i++) {
            col = i % COLS;
            row = Math.floor(i / COLS);

            var cell = new Cell(this);
            _cells[i] = cell;

            cell.x = cellWidth * col;
            cell.y = cellHeight * row;
            cell.width = cellWidth;
            cell.height = cellHeight;
            cell.scale = cellScale;
        }

        this.render();
    },

    initUsers: function (users) {
        var cellWidth = _gridWidth / COLS;
        var cellScale = cellWidth / CELL_WIDTH;
        var cellHeight = CELL_HEIGHT * cellScale;
        var rows = Math.round(_gridHeight / cellHeight);

        _cellsInPage = rows * COLS;
        _numUsers = users.length;
        _numPages = Math.ceil(_numUsers / _cellsInPage);

        if (_numPages === 0) {
            _numPages = 1;
        }

        var numCells = _numPages * _cellsInPage;
        var col = 0;
        var row = 0;

        for (var i = 0; i < numCells; i++) {
            col = i % COLS;
            row = Math.floor(i / COLS);

            var user = users[i];
            var cell = _cells[i];

            if (!cell) {
                cell = new Cell(this);
                _cells[i] = cell;
            }

            if (user) {
                if (cell.data) {
                    if (cell.data.userId !== user.userId) {
                        cell.data = user;
                        cell.isOwn = (user.userId === _userId);
                    }
                }
                else {
                    cell.data = user;
                    cell.isOwn = (user.userId === _userId);
                }
            }
            else {
                cell.data = null;
                cell.isOwn = false;

                cell.removeRenderer();
            }

            cell.width = cellWidth;
            cell.height = cellHeight;
            cell.scale = cellScale;
            cell.x = cellWidth * col;
            cell.y = cellHeight * row;

            cell.update();
        }

        this._updateUI();
        this.render();
    },

    updateUsers: function (users) {
        var cellWidth = _gridWidth / COLS;
        var cellScale = cellWidth / CELL_WIDTH;
        var cellHeight = CELL_HEIGHT * cellScale;
        var rows = Math.round(_gridHeight / cellHeight);
        var numUsers = users.length;
        var isAdd = _numUsers < numUsers;
        var diff = Math.abs(_numUsers - numUsers);

        _cellsInPage = rows * COLS;
        _numUsers = numUsers;
        _numPages = Math.ceil(_numUsers / _cellsInPage);

        if (_numPages === 0) {
            _numPages = 1;
        }

        if (diff === 0) {
            for (var i = 0; i < _numUsers; i++) {
                var user = users[i];
                var cell = _cells[i];
                var cellUser = cell.data;

                if (cellUser && user.userId === cellUser.userId) {
                    cell.updateBusyStatus(user);
                }
            }
        }
        else {
            if (isAdd) {
                for (var j = 0; j < diff; j++) {
                    var newUser = this._getNewUser(users);

                    if (newUser) {
                        /* var cell = this._getEmptyCell();

                        if (!cell) {
                            cell = new Cell(this);
                            cell.width = cellWidth;
                            cell.height = cellHeight;
                            cell.scale = cellScale;
                        } */
                        var cell = new Cell(this);
                        cell.width = cellWidth;
                        cell.height = cellHeight;
                        cell.scale = cellScale;

                        cell.data = newUser;
                        cell.isOwn = (newUser.userId === _userId);

                        // insert new cell at the index
                        _cells.splice(users.indexOf(newUser), 0, cell);
                    }
                }
            }
            else {
                for (var j = 0; j < diff; j++) {
                    var cellToRemove = this._getCellToRemove(users);

                    if (cellToRemove) {
                        cellToRemove.destroy();
                        _cells.splice(_cells.indexOf(cellToRemove), 1);
                    }
                }
            }
        }

        var numCells = _numPages * _cellsInPage;
        var col = 0;
        var row = 0;

        for (var i = 0; i < numCells; i++) {
            col = i % COLS;
            row = Math.floor(i / COLS);

            var cell = _cells[i];

            if (!cell) {
                cell = new Cell(this);
                _cells[i] = cell;

                cell.width = cellWidth;
                cell.height = cellHeight;
                cell.scale = cellScale;
            }

            cell.x = cellWidth * col;
            cell.y = cellHeight * row;

            cell.update();
        }

        this._updateUI();
        this.render();
        this.cleanUpCells();
    },

    // Called by Cell class
    add: function (renderer) {
        _grid.append(renderer);
    },

    select: function (data) {
        _view.select(data);
    },

    report: function (data) {
        _view.report(data);
    },

    findAndSelect: function (userId) {
        var users = this._getUsers();
        var numUsers = users.length;

        for (var i = 0; i < numUsers; i++) {
            var user = users[i];

            if (user.userId === userId) {
                this.select(user);
                return;
            }
        }
    },

    updateCellBusyStatus: function (data) {
        /* var users = this._getUsers();
        var numUsers = users.length;

        for (var i = 0; i < numUsers; i++) {
            var user = users[i];

            if (user.userId === data.userId) {
                users[i] = data;
                break;
            }
        } */

        var numCells = _cells.length;
        for (var i = 0; i < numCells; i++) {
            var cell = _cells[i];
            var cellData = cell.data;

            if (cellData && cellData.userId === data.userId) {
                cell.updateBusyStatus(data);
                return;
            }
        }
    },

    updateAvatar: function (userId) {
        for (var i = 0; i < _cells.length; i++) {
            var cell = _cells[i];

            if (cell.data && cell.data.userId === userId) {
                cell.updateAvatar();
                return;
            }
        }
    },

    getUserId: function () {
        return _userId;
    },

    getIp: function () {
        return _ip;
    },

    setIp: function (ip) {
        _ip = ip;
    },

    _updateUI: function () {
        var nav = $('nav');
        var footer = $('footer');
        var upBtn = $('#upBtn');
        var downBtn = $('#downBtn');

        if (_currentPage > 1) {
            nav.addClass('invisible');
            upBtn.removeClass('invisible');
        }
        else {
            nav.removeClass('invisible');
            upBtn.addClass('invisible');
        }

        if (_currentPage < _numPages) {
            footer.addClass('invisible');
            downBtn.removeClass('invisible');
        }
        else {
            footer.removeClass('invisible');
            downBtn.addClass('invisible');
        }
    },

    _isGridEmpty: function () {
        var numUsers = 0;

        for (var i = 0; i < _cells.length; i++) {
            var cell = _cells[i];
            numUsers += (cell.data ? 1 : 0);
        }

        return numUsers === 0;
    },

    _isGridVisible: function () {
        var el = _grid.get(0);

        return (el.offsetWidth > 0 && el.offsetHeight > 0);
    },

    _getUsers: function () {
        var users = [];

        for (var i = 0; i < _cells.length; i++) {
            var cell = _cells[i];

            if (cell.data) {
                users[i] = cell.data;
            }
        }

        return users;
    },

    _getNewUser: function (users) {
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            var cell = _cells[i];

            if (cell) {
                if (cell.data) {
                    if (cell.data.userId !== user.userId) {
                        return user;
                    }
                }
                else {
                    return user;
                }
            }
            else {
                return user;
            }
        }

        return null;
    },

    _getCellToRemove: function (users) {
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            var cell = _cells[i];

            if (cell.data) {
                if (user.userId !== cell.data.userId) {
                    return cell;
                }
            }
        }

        return _cells[users.length];
    },

    _getEmptyCell: function () {
        for (var i = _cells.length - 1; i >= 0; i--) {
            var cell = _cells[i];

            if (!cell.data) {
                _cells.splice(i, 1);
                return cell;
            }
        }

        return null;
    },

    _destroyCells: function () {
        for (var i = 0; i < _cells.length; i++) {
            _cells[i].destroy();
        }

        _cells = [];
    },


};

function createRenderer() {
    var div = $('<div data-toggle="popover" data-trigger="manual" data-placement="auto" data-html="true" class="renderer position-absolute">');
    var img = $('<img class="img-thumbnail w-100 h-100" src="../images/box.jpg" alt="">');
    var busyDiv = $('<div id="busy" class="position-absolute w-100 h-100 d-flex align-items-center justify-content-center invisible">');
    var busyHeader = $('<h2 class="text-danger mb-0">');
    var reportDiv = $('<div id="report" class="position-absolute icon-report d-none">');

    busyHeader.html('BUSY');
    busyDiv.append(busyHeader);

    div.append(img);
    div.append(busyDiv);
    div.append(reportDiv);

    return div;
}

function cleanUpCells() {
    var totalCells = _numPages * _cellsInPage;
    var i = _cells.length - 1;

    while (_cells.length > totalCells) {
        var cell = _cells[i];

        if (!cell.data) {
            cell.destroy();
            _cells.splice(i, 1);
        }

        i--;
    }
}

/* function getRenderer() {
    if (_rendererPool.length === 0) {
        var renderer = new createRenderer();

        _rendererPool.push(renderer);

        return renderer;
    }
    else {
        var renderer = null;

        for (var i = _rendererPool.length - 1; i >= 0; i--) {
            var r = _rendererPool[i];

            if (!r.cell) {
                renderer = r;
                break;
            }
        }

        if (!renderer) {
            renderer = createRenderer();
            _rendererPool.push(renderer);
        }

        return renderer;
    }
} */