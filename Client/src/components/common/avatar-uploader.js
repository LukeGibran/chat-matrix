import axios from 'axios';
import utils from './utils';

const avatarUploader = {
    upload(avatar, avatarID) {
        return new Promise((resolve, reject) => {
            if (!avatar) {
                return reject('Invalid avatar argument supplied');
            }

            const blob = dataURLtoBlob(avatar);
            var formData = new FormData();
            formData.append('profile', blob, avatarID);

            axios.post(`${utils.serverURL}/c/chat/profile`, formData)
                .then(response => {
                    if (response.data === 'success') {
                        resolve();
                    }
                    else {
                        reject(`Error uploading avatar: ${response.data}`);
                    }
                })
                .catch(error => reject(error));
        });
    }
};

function dataURLtoBlob(dataURL) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    let byteString;
    if (dataURL.split(',')[0].indexOf('base64') >= 0) {
        byteString = atob(dataURL.split(',')[1]);
    }
    else {
        byteString = unescape(dataURL.split(',')[1]);
    }

    // separate out the mime component
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    const ia = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
}

export default avatarUploader;
