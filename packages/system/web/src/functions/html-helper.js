export function prepareElement(element) {
  const originalAddEventListener = Element.prototype.addEventListener;
  const originalRemoveEventListener = Element.prototype.removeEventListener;

  Element.prototype.addEventListener = function (type, listener, options) {
    this._eventListeners = this._eventListeners || {};
    const event_obj = { listener, options };
    this._eventListeners[type] = this._eventListeners[type] || [];

    // Find the index of the existing event listener
    const existingListenerIndex = this._eventListeners[type].findIndex(l =>
      l.listener === listener && JSON.stringify(l.options) === JSON.stringify(options)
    );

    if (existingListenerIndex !== -1) {
      originalRemoveEventListener.call(
        this,
        type,
        this._eventListeners[type][existingListenerIndex].listener,
        this._eventListeners[type][existingListenerIndex].options,
      );

      this._eventListeners[type].splice(existingListenerIndex, 1);
    }

    this._eventListeners[type].push(event_obj);

    // this._eventListeners[type].push(listener);
    originalAddEventListener.call(this, type, listener, options);
  };

  Element.prototype.removeEventListener = function (type, listener, options) {
    if (this._eventListeners && this._eventListeners[type]) {
      const index = this._eventListeners[type].indexOf(listener);
      if (index !== -1) {
        this._eventListeners[type].splice(index, 1);
      }
    }
    originalRemoveEventListener.call(this, type, listener, options);
  };

  Element.prototype.getEventListeners = function () {
    return this._eventListeners;
  };
}