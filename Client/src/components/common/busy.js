let io = null;

const busy = {
    setIO(aIo) {
        io = aIo;
    },

    /**
     * 
     * @param {boolean} value 
     */
    update(value) {
        if (io === null) {
            return;
        }

        io.emit('UPDATE_BUSY_STATUS', value);
    }
};

export default busy;
