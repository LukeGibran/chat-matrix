(function () {
    var _ta = null;

    window.onload = function () {
        var div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.bottom = '10px';
        div.style.right = '10px';
        div.style.zIndex = 10000;

        var textArea = document.createElement('textarea');
        textArea.style.fontSize = '0.75rem';
        // textArea.style.display = 'none';
        textArea.setAttribute('id', 'loggerTextArea');
        textArea.setAttribute('rows', 10);
        textArea.setAttribute('cols', 45);
        textArea.setAttribute('readonly', true);

        var btn = document.createElement('button');
        btn.style.display = 'block';
        btn.innerHTML = 'Show Logs';
        btn.addEventListener('click', function () {
            if (textArea.style.display === 'none') {
                btn.innerHTML = 'Hide Logs';
                textArea.style.display = 'block';
            }
            else {
                btn.innerHTML = 'Show Logs';
                textArea.style.display = 'none';
            }
        });

        div.appendChild(textArea);
        div.appendChild(btn);
        document.body.appendChild(div);

        _ta = textArea;
    };

    window.log = function (msg) {
        if (_ta) {
            _ta.value += '> ' + msg + '\n';
            _ta.scrollTop = _ta.scrollHeight;
        }
    };
})();