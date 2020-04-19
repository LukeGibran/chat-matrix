var eventSource = require('../../event-source');
var utils = require('../../utils');

var Cell = function (container) {
    this.container = container;

    this.data = null;
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.scale = 1;

    this.isOwn = false;
    this.canReport = false;
    this.isDispose = false;
};

Cell.prototype = {
    update: function () {
        if (!this.renderer) {
            return;
        }

        var busy = this.renderer.find('#busy');
        var report = this.renderer.find('#report');
        var img = this.renderer.find('img');

        this.renderer.css({
            'left': this.x,
            'top': this.y,
            'width': this.width,
            'height': this.height,
            'transform-origin': 'bottom right'
        });

        busy.css({ 'transform': 'scale(' + this.scale + ')' });
        report.css({
            'transform-origin': 'bottom right',
            'transform': 'scale(' + this.scale + ')'
        });

        if (this.data) {
            utils.loadAvatar(img, this.data);

            if (this.isOwn) {
                this.renderer.css({ cursor: 'auto' });
            }
            else {
                if (this.data.isVip) {
                    img.addClass('bg-primary');
                    busy.hide();
                    this.renderer.css({ cursor: 'pointer' });
                }
                else {
                    if (this.data.isBusy) {
                        busy.show();
                        this.renderer.css({ cursor: 'auto' });
                    }
                    else {
                        busy.hide();
                        this.renderer.css({ cursor: 'pointer' });
                    }

                    if (this.canReport) {
                        report.show();
                    }
                    else {
                        report.hide();
                    }
                }
            }
        }
    },

    updateBusyStatus: function (data) {
        if (data) {
            this.data.isBusy = data.isBusy;
        }

        if (!this.renderer) {
            return;
        }

        var busy = this.renderer.find('#busy');

        if (this.isOwn) {// your avatar
            busy.hide();
            this.renderer.css({ cursor: 'auto' });
        }
        else {
            if (this.data.isVip) {
                busy.hide();
                this.renderer.css({ cursor: 'pointer' });
            }
            else {
                if (this.data.isBusy) {
                    busy.show();
                    this.renderer.css({ cursor: 'auto' });
                }
                else {
                    busy.hide();
                    this.renderer.css({ cursor: 'pointer' });
                }
            }
        }
    },

    updateAvatar: function (user) {
        if (!this.renderer || !this.data) {
            return;
        }

        if (this.data.avatarId === user.avatarId) {
            return;
        }

        this.data.avatarId = user.avatarId;

        utils.loadAvatar(this.renderer.find('img'), this.data);
    },

    dispose: function () {
        this.container = null;
        this.data = null;
        this.renderer = null;
    },

    _onClick: function (event) {
        if (!this.data || !this.renderer || this.isOwn || this.data.isBusy) {
            return;
        }

        if (event.target.id === 'report') {
            eventSource.emitter.emit(eventSource.REPORT_USER, this.data);
        }
        else {
            eventSource.emitter.emit(eventSource.SELECT_USER, this.data);
        }
    },

    _onMouseOver: function () {
        var data = this.data;

        if (!data || !data.isVip || !this.renderer) {
            return;
        }

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

    _onMouseOut: function () {
        if (!this.renderer) {
            return;
        }

        this.renderer.popover('hide');
    }
};

Object.defineProperty(Cell.prototype, 'renderer', {
    set: function (value) {
        if (value) {
            this._renderer = value;
            this._renderer.on('click', this._onClick.bind(this));

            if (!utils.isMobile()) {
                this._renderer.on('mouseover', this._onMouseOver.bind(this));
                this._renderer.on('mouseout', this._onMouseOut.bind(this));
            }

            this.container.append(this._renderer);
        }
        else {
            if (this._renderer) {
                this._renderer.off();
                this._renderer.find('#report').off();// call this when disposing the renderer
                this._renderer.popover('hide');
                this._renderer.remove();
                this._renderer = null;
            }
        }
    },

    get: function () {
        return this._renderer;
    }
});

module.exports = Cell;