export default {
  set socket(socket) {
    this._socket = socket;
  },

  get socket() {
    return this._socket;
  },
};
