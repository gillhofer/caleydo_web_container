/**
 * Created by Marc Streit on 06.08.2014.
 * globals define
 */
var __extends = this.__extends || function (d, b) {
  for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
  function __() { this.constructor = d; }
  __.prototype = b.prototype;
  d.prototype = new __();
};
define(['exports', 'jquery', '../caleydo-events', 'jquery-ui'], function (exports, $, events) {
  var Window = (function (_super) {
    __extends(Window, _super);
    function makeDraggable($div, window) {
      var convertDrag = function (ui) {
        return [ { position : ui.position, offset : ui.offset}];
      };
      $div.draggable({
        scroll: true, //auto scroll viewport
        handle: "> h3", //just drag using the header
        start: function (event, ui) {
          window.fire('drag_start', convertDrag(ui));
        },
        stop: function (event, ui) {
          window.fire('drag_stop', convertDrag(ui));
        },
        drag: function (event, ui) {
          window.fire('drag', convertDrag(ui));
        }
      });
    }

    function makeResizeable($div, window) {
      var convertResize = function (ui) {
        return [
          {
            originalPosition: ui.originalPosition,
            originalSize: ui.originalSize,
            position: ui.position,
            size: ui.size
          }
        ];
      };
      $div.resizable({
        minHeight: window.options.minHeight,
        minWidth: window.options.minWidth,
        start: function (event, ui) {
          window.fire('resize_start', convertResize(ui));
        },
        stop: function (event, ui) {
          window.fire('resize_stop', convertResize(ui));
        },
        resize: function (event, ui) {
          window.fire('resize', convertResize(ui));
        }
      });
    }

    function makeCloseable($div, window) {
      //TODO
    }

    function Window(parent, options) {
      _super.call(this);
      this.options = $.extend({}, options || {}, {
        resizeable: true,
        draggable: true,
        closeable: false,
        minHeight : 145,
        minWidth: 100
      });
      this.$parent = $(parent);
      this.$div = $("<div/>").appendTo(this.$parent)
        .addClass("ui-widget-content window")
        .css({
          position: 'absolute',
          left: 0,
          top: 0,
          width: 100,
          height: 100
        });
      //title
      $("<h3>").appendTo(this.$div)
        .addClass("ui-widget-header")
        .disableSelection(); //no selection of header for dragging
      //content
      this.$div.append("<div class='content'/>");

      if (this.options.draggable) {
        makeDraggable(this.$div, this);
      }
      if (this.options.resizeable) {
        makeResizeable(this.$div, this);
      }
      if (this.options.closeable) {
        makeCloseable(this.$div, this);
      }
      /**
       * property for getting setting the title
       */
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
      /**
       * property for the size of the window
       */
      Object.defineProperty(Window.prototype, "size", {
        get: function () {
          return [this.$div.width(), this.$div.height()];
        },
        set: function (val) {
          this.$div.css('width', val[0]);
          this.$div.css('height', val[1]); //for header
        },
        enumerable: true,
        configurable: true
      });
      /**
       * property for the size of the content (without header)
       */
      Object.defineProperty(Window.prototype, "contentSize", {
        get: function () {
          var s = this.size;
          return [s[0], s[1] - 20];
        },
        set: function (val) {
          this.size = [val[0], val[1] + 20];
        },
        enumerable: true,
        configurable: true
      });
      /**
       * property for the window position
       */
      Object.defineProperty(Window.prototype, "pos", {
        get: function () {
          var p = this.$div.position();
          return [p.left, p.top];
        },
        set: function (val) {
          this.$div.css('left', val[0]);
          this.$div.css('top', val[1]);
        },
        enumerable: true,
        configurable: true
      });
      /**
       * getter of the content node
       */
      Object.defineProperty(Window.prototype, "node", {
        get: function () {
          return this.$div.find('div')[0];
        },
        enumerable: true,
        configurable: true
      });
    }

    return Window;
  }(events.EventHandler));

  exports.Window = Window;

  function create(parent, options) {
    return new Window(parent, options);
  }

  exports.create = create;
});
