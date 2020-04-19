var HOST_URL = window.location.protocol + '//' + window.location.host;

/* var _torrentClient = new WebTorrent();
var _torrent = null;
var _dataURL = null; */

module.exports = {
    createAvatarURL: function (user) {
        return HOST_URL + '/profile/' + user.avatarId;
    },

    loadAvatar: function (user, img) {
        var self = this;
        var tries = 0;
        var url = self.createAvatarURL(user);

        load();

        function load() {
            if (tries === 3) {
                img.attr('src', '../images/avatar.jpg');
                return;
            }

            tries++;

            img.attr('src', url);
            img.on('error', load);
        }
    },

    dataURLtoBlob: function (dataURL) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURL.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURL.split(',')[1]);
        else
            byteString = unescape(dataURL.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], { type: mimeString });
    }/* ,

    dataURLtoFile: function (dataurl, filename) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    },

    seedTorrent: function (dataURL, filename, onSuccess, onError) {
        _dataURL = dataURL;
        var file = this.dataURLtoFile(_dataURL, filename);
        console.log(file);

        _torrentClient.on('error', function (error) {
            console.log(error);
            if (onError) {
                onError(error);
            }
        });

        _torrentClient.seed(file, function (torrent) {
            _torrent = torrent;
            console.log('Seeding ', _torrent.infoHash);
            console.log('torrents', _torrentClient.torrents.length);

            if (onSuccess) {
                onSuccess(_torrent);
            }
        });
    },

    downloadTorrent: function (magnetURI, img) {
        _torrentClient.on('error', function (error) {
            console.log(error);
        });

        _torrentClient.add(magnetURI, onTorrent);

        function onTorrent(torrent) {
            console.log('download', torrent.infoHash);
            console.log('torrents', _torrentClient.torrents.length);
            torrent.files.forEach(function (file) {
                file.renderTo(img.get(0));
            });
        }
    },

    removeTorrent: function (magnetURI) {
        _torrentClient.remove(magnetURI, function (error) {
            console.log(error);
            console.log('torrents', _torrentClient.torrents.length);
        });
    },

    getTorrent: function () {
        return _torrent;
    },

    getDataURL: function () {
        return _dataURL;
    } */
};