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
define(['exports', 'jquery', '../caleydo-events', '../caleydo', '../caleydo-geom', 'jquery-ui','fontawesome'], function (exports, $, events, C, geom) {
  var Window = (function (_super) {
    __extends(Window, _super);
    function makeDraggable($div, window) {
      var convertDrag = function (ui) {
        return [ { position : ui.position, offset : ui.offset}];
      };
      $div.draggable({
        scroll: true, //auto scroll viewport
        handle: 'div.ui-widget-header h3', //just drag using the header
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

    function makeAnimatedHeader($div, $header) {
      //on mouse enter show the toolbar on top of it
      $div.on({
        mouseenter: function () {
          //move up and slide down at the same time = sliding from bottom to top
          $header.stop().animate({
            top: -$header.height(),
            height: 'show'
          });
        },
        mouseleave: function () {
          $header.stop().animate({
            top: '0',
            height: 'hide'
          });
        }
      });
      //hide header by default
      $header.addClass('animated').hide();
    }

    function makeCloseable($toolbar, window) {
      $('<i class="fa fa-close">').appendTo($toolbar).click(function() {
        window.close();
      }).attr('title','Close');
    }

    function makeZControls($toolbar, $div) {
      $('<i class="fa fa-caret-square-o-up">').prependTo($toolbar).click(function() {
        $div.css('z-index','+=1')
      }).attr('title','Move Up');
      $('<i class="fa fa-caret-square-o-down">').prependTo($toolbar).click(function() {
        $div.css('z-index','-=1')
      }).attr('title','Move Down');
    }

    function Window(parent, options) {
      _super.call(this);
      this.options = $.extend({}, {
        resizeable: true,
        draggable: true,
        closeable: false,
        zcontrols: false,
        animatedHeader: false,
        minHeight: 145,
        minWidth: 100
      }, options);
      this.$parent = $(parent);
      this.$div = $('<div/>').appendTo(this.$parent)
        .addClass('ui-widget-content window')
        .css({
          left: 0,
          top: 0,
          width: 100,
          height: 100,
          'z-index': 0
        });
      //title
      this.$header = $('<div>').appendTo(this.$div)
        .addClass('ui-widget-header');
      $('<h3>').appendTo(this.$header)
        .disableSelection(); //no selection of header for dragging
      this.$toolbar = $('<div class="toolbar">').appendTo(this.$header);
      //content
      this.$div.append('<div class="content"/>');

      if (this.options.draggable) {
        makeDraggable(this.$div, this);
      }
      if (this.options.resizeable) {
        makeResizeable(this.$div, this);
      }
      if (this.options.animatedHeader) {
        makeAnimatedHeader(this.$div, this.$header);
      }
      if (this.options.closeable) {
        makeCloseable(this.$toolbar, this);
      }
      if (this.options.zcontrols) {
        makeZControls(this.$toolbar, this.$div);
      }
    }

    /**
     * closes this window
     */
    Window.prototype.close = function() {
      this.$div.remove();
      this.fire('removed', this);
    };

    /**
     * return an adapter for a IVisInstance, which is shifted by the own position
     * @param vis
     * @returns {{data: *, locate: locate}}
     */
    Window.prototype.adapter = function(vis) {
      var that = this;
      var r = {
        data : vis.data,
        locate : function () {
          return vis.locate.apply(vis, C.argList(arguments)).then(function (r) {
            var p = that.pos;
            if (C.isArray(r)) {
              return r.map( function (loc) {
                return geom.wrap(loc).shift(p);
              })
            } else {
              geom.wrap(r).shift(p);
            }
          })
        }
      };
      return r;
    };

    /**
     * property for getting setting the title
     */
    Object.defineProperty(Window.prototype, 'title', {
      get: function () {
        return this.$header.find('h3').text();
      },
      set: function (val) {
        this.$header.find('h3').html(val);
      },
      enumerable: true,
      configurable: true
    });
    /**
     * property for the size of the window
     */
    Object.defineProperty(Window.prototype, 'size', {
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
    Object.defineProperty(Window.prototype, 'contentSize', {
      get: function () {
        var s = this.size;
        return [s[0], s[1] - (this.options.animatedHeader ? 0 : 20)];
      },
      set: function (val) {
        this.size = [val[0], val[1] + (this.options.animatedHeader ? 0 : 20)];
      },
      enumerable: true,
      configurable: true
    });
    /**
     * property for the window position
     */
    Object.defineProperty(Window.prototype, 'pos', {
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
    Object.defineProperty(Window.prototype, 'node', {
      get: function () {
        return this.$div.find('div.content')[0];
      },
      enumerable: true,
      configurable: true
    });
    /**
     * getter of the content node
     */
    Object.defineProperty(Window.prototype, 'toolbar', {
      get: function () {
        return this.$header.find('div.toolbar')[0];
      },
      enumerable: true,
      configurable: true
    });
    return Window;
  }(events.EventHandler));

  exports.Window = Window;

  function create(parent, options) {
    return new Window(parent, options);
  }

  exports.create = create;
});
