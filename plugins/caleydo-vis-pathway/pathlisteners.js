/**
 * Created by Christian on 19.02.2015.
 */
define(function() {
  return {
    listeners: [],

    add: function (listener) {
      this.listeners.push(listener);
    },

    notify: function (path) {
      this.listeners.forEach(function (listener) {
        listener(path);
      });
    }
  }
})
