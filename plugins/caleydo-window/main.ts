/**
 * Created by AK113797 on 24.11.2014.
 */
/// <amd-dependency path="jquery-ui" />
/// <amd-dependency path="font-awesome" />


import $ = require('jquery');
import events = require('../caleydo/event');
import C = require('../caleydo/main');
import geom = require('../caleydo/geom');
import idtypes = require('../caleydo/idtype');
import vis = require('../caleydo/vis');
import datatypes = require('../caleydo/datatype');

function makeDraggable($div, window) {
  var convertDrag = function (ui) {
    return {position: ui.position, offset: ui.offset};
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

function makeResizeable($div, window, options = {}) {
  var convertResize = function (ui) {
    return {
        originalPosition: ui.originalPosition,
        originalSize: ui.originalSize,
        position: ui.position,
        size: ui.size
      };
  };
  $div.resizable($.extend({
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
    },
    autoHide: true,
    delay: 150,
    distance: 10
  }, options));
}

function destroyResizeable($div) {
  $div.resizable("destroy");
}

function makeAnimatedHeader($div, $header) {
  $div.on({
    mouseenter: function () {
      //change just the opacity
      $header.css('opacity', 1);
    },
    mouseleave: function () {
      $header.css('opacity', 0);
    }
  });
  //hide header by default
  $header.css('opacity', 0);
}

function destroyAnimatedHeader($div, $header) {
  $div.off('mouseenter').off('mouseleave');
  $header.css('opacity', null);
}


export class UIWindow extends events.EventHandler implements events.IDataBinding {
  options : any;
  private $parent : JQuery;
  private $div : JQuery;
  private $header: JQuery;
  toolbar: ToolBar;
  private $content : JQuery;
  private _data = {};

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
    this.$div.on({
      mouseenter: () => this.fire('mouseenter', this),
      mouseleave: () => this.fire('mouseleave', this)
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

  data(name : string, value? : any) {
    if (arguments.length === 1) {
      return this._data[name];
    }
    var bak = this._data[name];
    this._data[name] = value;
    return bak;
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

  get contentPos() : number[] {
    var p = this.pos;
    var pp = this.$content.position();
    p[0] += pp.left;
    p[1] += pp.top;
    return p;
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

export interface ToolbarBuilder {
  (window: UIWindow, node: Element) : void;
}

export class ToolBar {
  window : UIWindow;
  private $node : JQuery;
  builder : ToolbarBuilder[] = [];

  constructor(parent: Element) {
    this.$node = $('<div class="toolbar" />').appendTo(parent);
  }

  bindTo(window : UIWindow) {
    this.window = window;
    this.$node.empty();
    if (window) {
      this.rebuild();
    }
  }

  rebuild() {
    this.builder.forEach((b) => b.call(this, this.window, this.$node[0]));
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

  addButton(icon : string, title: string, callback : (window: UIWindow) => void) {
    $('<i class="fa '+icon+'">').appendTo(this.$node).click(() => {
      callback.call(this, this.window);
    }).attr('title', title);
  }

  get node() {
    return this.$node[0];
  }
}

export class StaticToolBar extends ToolBar {
  private windows : UIWindow[] = [];
  constructor(parent: Element) {
    super(parent);
  }

  push(window : UIWindow) {
    window.on('mouseenter', (_, w) => {
      this.bindTo(w);
    }).on('mouseleave', (_, w) => {
      this.bindTo(null);
    }).on('removed', (_, w) => {
      if (this.window === w) {
        this.bindTo(null);
      }
      //this.windows.splice(this.windows.indexOf(w),1);
    })
  }
}

export class VisWindow extends UIWindow {
  private vis_: vis.IVisInstance;
  private visMeta_ : vis.IVisMetaData;

  constructor(parent, options) {
    super(parent, options);

    if (options.zoomAble) {
      $(this.node).on('mousewheel', (event) => {
        var ctrlKey = event.ctrlKey;
        var shiftKey = event.shiftKey;
        var altKey = event.altKey;
        var m = (<any>event).originalEvent.wheelDelta;
        this.zoom(m * (ctrlKey || shiftKey ? 1: 0), m * (ctrlKey || altKey ? 1 : 0));
        return !(ctrlKey || shiftKey || altKey);
      });
    }
  }

  zoomIn() {
    return this.zoom(1,1);
  }
  zoomOut() {
    return this.zoom(-1,-1);
  }

  zoom (zoomX: number, zoomY : number) {
    if (!this.vis_) {
      return null;
    }
    function toDelta(x) {
      return x > 0 ? 0.2 : (x < 0 ? -0.2 : 0);
    }
    var old = this.vis_.transform();
    var deltaX = toDelta(zoomX);
    var deltaY = toDelta(zoomY);
    return this.zoomSet(old.scale[0] + deltaX, old.scale[1] + deltaY);
  }

  zoomSet(zoomX : number, zoomY : number) {
    if (!this.vis_) {
      return null;
    }
    var old = this.vis_.transform();
    var s = [zoomX, zoomY];;
    switch(this.visMeta_.size.scale) {
      case 'width-only':
        s[1] = old.scale[1];
        break;
      case 'height-only':
        s[0] = old.scale[0];
        break;
    }
    if (s[0] <= 0) {
      s[0] = 0.001;
    }
    if (s[1] <= 0) {
      s[1] = 0.001;
    }
    this.fire('zoom', {
      scale : s,
      rotate: old.rotate
    }, old);
    return this.vis_.transform(s, old.rotate);
  }

  zoomTo(w : number, h : number) {
    if (!this.vis_) {
      return null;
    }
    var ori = this.visMeta.size(this.vis_.data.dim);
    return this.zoomSet(w / ori[0], h/ori[1]);
  }

  get vis() {
    return this.vis_;
  }

  get visMeta() {
    return this.visMeta_;
  }

  attachVis(vis : vis.IVisInstance, visMeta : vis.IVisMetaData);
  attachVis(factory: (node: Element) => { vis: vis.IVisInstance; meta: vis.IVisMetaData });
  attachVis(vis_or_factory: any) {
    var v, meta;
    if (C.isFunction(vis_or_factory)) {
      var r = vis_or_factory(this.node);
      v = r.vis;
      meta = r.meta;
    } else {
      v = arguments[0];
      meta = arguments[1];
    }
    this.vis_ = v;
    this.visMeta_ = meta;
    this.data('vis', this.vis_);
    this.data('visMeta', this.visMeta_);

    this.title = v.data.desc.name;
    var that = this;
    function updateResizeAble() {
      if (that.options.resizeable) {
        var $content : any= $(that.node);
        var oldAspectRatio = $content.resizable('option', 'aspectRatio');
        var oldHandles = $content.resizable('option', 'handles');
        var newAspectRatio = false;
        var newHandles = 'e,s,se';
        switch(meta.size.scale) {
          case 'aspect':
            newAspectRatio = true;
            break;
          case 'width-only':
            newHandles = 'e';
            break;
          case 'height-only':
            newHandles = 's';
            break;
        }
        if (newAspectRatio !== oldAspectRatio || newHandles !== oldHandles) {
          destroyResizeable($content);
          makeResizeable($content, that, {
            aspectRatio : newAspectRatio,
            handles : newHandles
          });
        }
      }
    }
    updateResizeAble();
    this.on('resize', (event, pos) => {
      this.zoomTo(pos.size.width, pos.size.height);
    });

    //TODO compute size
    this.contentSize = meta.size.scaled(v.data.dim, v.transform());

    v.on('changed', () => {
      this.contentSize = meta.size.scaled(v.data.dim, v.transform());
      updateResizeAble();
    });
    v.on('transform', () => {
      this.contentSize = meta.size.scaled(v.data.dim, v.transform());
    });
    this.on('removed', () => {
      v.destroy();
    });
    //var vis = mw.adapter(multi);
    return this.vis_;
  }

  /**
   * return an adapter for a IVisInstance, which is shifted by the own position
   * @param vis
   * @returns {{data: *, locate: locate}}
   */
  adapter(vis): vis.ILocateAble {
    var that = this;
    var r = {
      data: vis.data,
      locate: function () {
        if (!C.isFunction(vis.locate)) {
          return C.resolved((arguments.length === 1 ? undefined : new Array(arguments.length)));
        }
        return vis.locate.apply(vis, C.argList(arguments)).then(function (r) {
          var p = that.contentPos;
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
}

export function create(parent, options) {
  return new UIWindow(parent, options);
}

export function createVisWindow(parent, options) {
  return new VisWindow(parent, options);
}
