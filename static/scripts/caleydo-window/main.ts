/**
 * Created by AK113797 on 24.11.2014.
 */
/// <amd-dependency path="jquery-ui" />
/// <amd-dependency path="font-awesome" />


import $ = require('jquery');
import events = require('../caleydo/event');
import C = require('../caleydo/main');
import geom = require('../caleydo/geom');

function makeDraggable($div, window) {
  var convertDrag = function (ui) {
    return [{position: ui.position, offset: ui.offset}];
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

function destroyDraggable($div) {
  $div.draggable("destroy");
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
    //minHeight: window.options.minHeight,
    //minWidth: window.options.minWidth,
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

function destroyResizeable($div) {
  $div.resizable("destroy");
}

function makeAnimatedHeader($div, $header) {
  //on mouse enter show the toolbar on top of it
  $div.on({
    mouseenter: function () {
      //move up and slide down at the same time = sliding from bottom to top
      $header.animate({
        opacity: 1
      });
    },
    mouseleave: function () {
      $header.animate({
        opacity: 0
      });
    }
  });
  //hide header by default
  $header.css('opacity', 0);
}

function destroyAnimatedHeader($div, $header) {
  $div.off('mouseenter').off('mouseleave');
  $header.removeClass('animated').show();
}


export class Window extends events.EventHandler {
  private options : any;
  private $parent : JQuery;
  private $div : JQuery;
  private $header: JQuery;
  toolbar: ToolBar;
  private $content : JQuery;

  constructor(parent, options) {
    super();
    this.options = C.mixin({
      resizeable: true,
      draggable: true
    }, options);

    this.$parent = $(parent);
    this.$div = $('<div/>').appendTo(this.$parent)
      .addClass('ui-widget-content window')
      .css({
        left: 0,
        top: 0,
        'z-index': 0
      });
    //title
    this.$header = $('<div>').appendTo(this.$div)
      .addClass('ui-widget-header');
    (<any>$('<h3>').appendTo(this.$header))
      .disableSelection(); //no selection of header for dragging
    this.toolbar = new ToolBar(this.$header[0]);
    //content
    this.$content = $('<div class="content"/>').appendTo(this.$div);

    if (this.options.draggable) {
      makeDraggable(this.$div, this);
    }
    if (this.options.resizeable) {
      makeResizeable(this.$content, this);
    }
    if (this.options.animatedHeader) {
      makeAnimatedHeader(this.$div, this.$header);
    }
    this.toolbar.bindTo(this);
  }

  /**
   * closes this window
   */
  close() {
    this.$div.remove();
    this.fire('removed', this);
  }

  incZLevel() {
    return this.changeZLevel(+1);
  }

  decZLevel() {
    return this.changeZLevel(+1);
  }

  changeZLevel(delta : number) {
    if (delta < 0) {
      this.$div.css('z-index', '-='+(-delta));
    } else {
      this.$div.css('z-index', '+='+delta);
    }
  }

  /**
   * return an adapter for a IVisInstance, which is shifted by the own position
   * @param vis
   * @returns {{data: *, locate: locate}}
   */
  adapter(vis) {
    var that = this;
    var r = {
      data: vis.data,
      locate: function () {
        if (!C.isFunction(vis.locate)) {
          return C.resolved((arguments.length === 1 ? undefined : new Array(arguments.length)));
        }
        return vis.locate.apply(vis, C.argList(arguments)).then(function (r) {
          var p = that.pos;
          if (C.isArray(r)) {
            return r.map(function (loc) {
              return loc ? geom.wrap(loc).shift(p) : loc;
            })
          } else {
            return r ? geom.wrap(r).shift(p) : r;
          }
        });
      }
    };
    return r;
  }

  persist() {
    return {
      title: this.title,
      size: this.size,
      pos: this.pos,
      options: this.options
    }
  }

  restore(persisted:any) {
    var bak = this.options;
    this.options = persisted.options;

    if (this.options.draggable !== bak.draggable) {
      if (this.options.draggable) {
        makeDraggable(this.$div, this);
      } else {
        destroyDraggable(this.$div);
      }
    }
    if (this.options.resizeable !== bak.resizeable) {
      if (this.options.resizeable) {
        makeResizeable(this.$content, this);
      } else {
        destroyResizeable(this.$content);
      }
    }
    if (this.options.animatedHeader !== bak.animatedHeader) {
      if (this.options.animatedHeader) {
        makeAnimatedHeader(this.$div, this.$header);
      } else {
        destroyAnimatedHeader(this.$div, this.$header);
      }
    }

    this.title = persisted.title;
    this.size = persisted.size;
    this.pos = persisted.pos;

    return null;
  }

  /**
   * property for getting setting the title
   */
  get title():string {
    return this.$header.find('h3').text();
  }

  set title(val:string) {
    this.$header.find('h3').html(val);
  }

  /**
   * property for the size of the window
   */
  get size() : number[] {
    return [this.$content.width(), this.$content.height()];
  }

  set size(val: number[]) {
    this.$content.css('width', val[0]);
    this.$content.css('height', val[1]);
  }

  /**
   * property for the size of the content (without header)
   */
  get contentSize(): number[] {
    var s = this.size;
    return [s[0], s[1] - (this.options.animatedHeader ? 0 : 20)];
  }

  set contentSize(val:number[]) {
    this.size = [val[0], val[1] + (this.options.animatedHeader ? 0 : 20)];
  }

  /**
   * property for the window position
   */
  get pos(): number[] {
    var p = this.$div.position();
    return [p.left, p.top];
  }

  set pos(val:number[]) {
    this.$div.css('left', val[0] + 'px');
    this.$div.css('top', val[1] + 'px');
  }

  /**
   * getter of the content node
   */
  get node() {
    return this.$content[0];
  }
}

export class ToolBar {
  window : Window;
  private $node : JQuery;

  constructor(parent: Element) {
    this.$node = $('<div class="toolbar" />').appendTo(parent);

  }

  bindTo(window : Window) {
    this.window = window;
    this.$node.empty();
    this.rebuild();
  }

  rebuild() {
    this.addButton('fa-caret-square-o-up', 'Move Up', (window) => {
        window.incZLevel();
    });
    this.addButton('fa-caret-square-o-down', 'Move Down', (window) => {
      window.decZLevel();
    });
    this.addButton('fa-close','Close', (window) => {
      window.close();
    });
  }

  addButton(icon : string, title: string, callback : (window: Window) => void) {
    $('<i class="fa '+icon+'">').appendTo(this.$node).click(() => {
      callback.call(this, this.window)
    }).attr('title', title);
  }

  get node() {
    return this.$node[0];
  }
}

export function create(parent, options) {
  return new Window(parent, options);
}
