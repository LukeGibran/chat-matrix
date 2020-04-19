var avatarUtils = require('../../utils/avatar-utils');
var webRTCUtil = require('../../utils/webRTC-util');

var Cell = function (grid) {
    this._grid = grid;

    this.renderer = null;
    this.isOwn = false;

    this._data = null;
    this._x = 0;
    this._y = 0;
    this._width = 0;
    this._height = 0;
    this._scale = 1;

    this._dataInvalid = false;
    this._positionInvalid = false;
    this._sizeInvalid = false;

    this.isDestroy = false;
};

Cell.prototype = {
    update: function () {
        if (!this.renderer) { return; }

        var busy = this.renderer.find('#busy');
        var busyHeader = busy.find('h2');
        var report = this.renderer.find('#report');

        if (this._dataInvalid) {
            this._dataInvalid = false;

            var img = this.renderer.find('img');

            if (this.data) {
                avatarUtils.loadAvatar(this.data, img);

                if (this.isOwn) {
                    img.removeClass('bg-primary');
                    busy.addClass('invisible');
                    this.renderer.css({ cursor: 'auto' });
                }
                else {
                    if (this.data.isVip) {
                        img.addClass('bg-primary');
                        busy.addClass('invisible');
                    }
                    else {
                        img.removeClass('bg-primary');

                        if (this.data.isBusy) {
                            busy.removeClass('invisible');
                        }
                        else {
                            busy.addClass('invisible');
                        }
                    }

                    if (!this.data.isBusy) {
                        this.renderer.css({ cursor: 'pointer' });
                    }
                    else {
                        this.renderer.css({ cursor: 'auto' });
                    }
                }

                this.updateReport();
                this.updateBusyStatus();
            }
        }

        if (this._positionInvalid) {
            this._positionInvalid = false;

            this.renderer.css({ left: this.x, top: this.y });
        }

        if (this._sizeInvalid) {
            this._sizeInvalid = false;

            this.renderer.css({ width: this.width, height: this.height });

            busyHeader.css({ transform: 'scale(' + this.scale + ')' });
            report.css({
                transformOrigin: 'bottom right',
                transform: 'scale(' + this.scale + ')'
            });
        }
    },

    setRenderer: function (renderer) {
        if (!renderer) { return; }

        this.renderer = renderer;

        this._grid.add(this.renderer);

        this._dataInvalid = true;
        this._positionInvalid = true;
        this._sizeInvalid = true;

        this.renderer.on('click', this._onClick.bind(this));

        if (!webRTCUtil.isMobile()) {
            this.renderer.mouseover(this._onMouseover.bind(this));
            this.renderer.mouseout(this._onMouseout.bind(this));
        }

        this.update();
    },

    removeRenderer: function () {
        if (!this.renderer) { return; }

        this.renderer.remove();
        this.renderer.off('click');
        this.renderer.unbind('mouseover').unbind('mouseout');

        this.renderer = null;
    },

    destroy: function () {
        this.removeRenderer();

        this._grid = null;
        this.isOwn = false;

        this._data = null;
        this._x = 0;
        this._y = 0;
        this._width = 0;
        this._height = 0;
        this._scale = 1;

        this._dataInvalid = false;
        this._positionInvalid = false;
        this._sizeInvalid = false;
    },

    updateBusyStatus: function (data) {
        if (data) {
            this.data.isBusy = data.isBusy;
        }

        if (!this.renderer) { return; }

        var busy = this.renderer.find('#busy');

        busy.addClass('invisible');
        this.renderer.css({ cursor: 'auto' });

        if (!this.isOwn) {
            if (!this.data.isVip && this.data.isBusy) {
                busy.removeClass('invisible');
            }

            if (!this.data.isBusy) {
                this.renderer.css({ cursor: 'pointer' });
            }
            else {
                this.renderer.css({ cursor: 'auto' });
            }
        }
    },

    updateAvatar: function () {
        this._dataInvalid = true;
        this.update();
    },

    updateReport: function () {
        var report = this.renderer.find('#report');

        if (this.isOwn || this.data.isVip || !this._grid.getIp() || this._grid.getIp() === this.data.IP) {
            report.addClass('d-none');
        }
        else {
            report.removeClass('d-none');
        }
    },

    _onClick: function (event) {
        var data = this.data;

        if (!data) { return; }
        if (this.isOwn || data.isBusy) { return; }

        if (event.target.id === 'report') {
            this._grid.report(data);
        }
        else {
            this.renderer.popover('hide');
            this._grid.select(data);
        }
    },

    _onMouseover: function () {
        var data = this.data;

        if (!data) { return; }
        if (!data.isVip) { return; }
        if (!this.renderer) { return; }

        this.renderer.popover({
            container: 'body',
            template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body p-0"></div></div>',
            content: function () {
                return '<img src="' + data.profilePicture + '" width="240" height="240"/>' +
                    '<div class="mx-2 my-1 text-center"><strong>' +
                    data.fullname + '</strong><br/>' +
                    '(@' + data.username + ')<br/>' +
                    data.followedBy + ' followers</div>';
            }
        });
        this.renderer.popover('show');
    },

    _onMouseout: function () {
        if (!this.renderer) { return; }

        this.renderer.popover('hide');
    }
};

Object.defineProperty(Cell.prototype, 'data', {
    get: function () {
        return this._data;
    },

    set: function (value) {
        this._data = value;
        this._dataInvalid = true;
    }
});

Object.defineProperty(Cell.prototype, 'x', {
    get: function () {
        return this._x;
    },

    set: function (value) {
        this._x = value;
        this._positionInvalid = true;
    }
});

Object.defineProperty(Cell.prototype, 'y', {
    get: function () {
        return this._y;
    },

    set: function (value) {
        this._y = value;
        this._positionInvalid = true;
    }
});

Object.defineProperty(Cell.prototype, 'width', {
    get: function () {
        return this._width;
    },

    set: function (value) {
        this._width = value;
        this._sizeInvalid = true;
    }
});

Object.defineProperty(Cell.prototype, 'height', {
    get: function () {
        return this._height;
    },

    set: function (value) {
        this._height = value;
        this._sizeInvalid = true;
    }
});

Object.defineProperty(Cell.prototype, 'scale', {
    get: function () {
        return this._scale;
    },

    set: function (value) {
        this._scale = value;
        this._sizeInvalid = true;
    }
});

module.exports = Cell;