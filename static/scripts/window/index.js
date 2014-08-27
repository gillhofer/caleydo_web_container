/**
 * Created by Marc Streit on 06.08.2014.
 * globals define
 */
define(['exports', 'jquery', 'jquery-ui'], function (exports, $) {
  var Window = (function () {
    function Window(parent) {
      this.$parent = $(parent);
      this.$div = $("<div/>").appendTo(this.$parent).addClass("ui-widget-content");
      $("<h3>").appendTo(this.$div)
        .addClass("ui-widget-header")
        .disableSelection(); //no selection of header for dragging
      this.$div.append("<div/>");
      this.$div.draggable({
        scroll: true, //auto scroll viewport
        handle: "> h3" //just drag using the header
      });
      this.$div.resizable({
        minHeight: 145,
        minWidth: 100
      });
      Object.defineProperty(Window.prototype, "title", {
        get: function () {
          return this.$div.find('h3').text();
        },
        set: function (val) {
          this.$div.find('h3').html(val);
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(Window.prototype, "size", {
        get: function () {
          return [this.$div.css('width'), this.$div.css('height') - 45];
        },
        set: function (val) {
          this.$div.css('width', val[0]);
          this.$div.css('height', val[1] + 45); //for header
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(Window.prototype, "pos", {
        get: function () {
          return [this.$div.css('left'), this.$div.css('top')];
        },
        set: function (val) {
          this.$div.css('left', val[0]);
          this.$div.css('top', val[1]);
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(Window.prototype, "node", {
        get: function () {
          return this.$div.find('div')[0];
        },
        enumerable: true,
        configurable: true
      });
    }
    return Window;
  }());
  exports.Window = Window;

  function create(parent) {
    return new Window(parent);
  }

  exports.create = create;
});
