var _request_ = {
    get(url, params) {
        if (params) {
            url = url + formatGetParams(params);
        }

        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    }
                    catch (error) {
                        resolve(xhr.responseText);
                    }
                }
            };

            xhr.onerror = function (error) {
                reject(error);
            };

            xhr.onabort = function (event) {
                reject(event);
            };

            xhr.ontimeout = function (error) {
                reject(error);
            };

            xhr.send();
        });
    },

    post(url, params) {
        if (params) {
            if (!(params instanceof FormData)) {
                params = JSON.stringify(params);
            }
        }

        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);

            if (!(params instanceof FormData)) {
                xhr.setRequestHeader('Content-Type', 'application/json');
            }

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    }
                    catch (error) {
                        resolve(xhr.responseText);
                    }
                }
                else if (xhr.readyState === 4 && xhr.status !== 200) {
                    reject('XMLHttpRequest status: ' + xhr.status);
                }
            };

            xhr.onerror = function (error) {
                reject(error);
            };

            xhr.onabort = function (event) {
                reject(event);
            };

            xhr.ontimeout = function (error) {
                reject(error);
            };

            xhr.send(params);
        });
    }
};

function formatGetParams(params) {
    return '?' + Object
        .keys(params)
        .map(function (key) {
            return key + '=' + encodeURIComponent(params[key]);
        })
        .join('&');
}

module.exports = _request_;