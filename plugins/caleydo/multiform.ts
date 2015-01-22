/**
 * Created by Samuel Gratzl on 27.08.2014.
 */

'use strict';
import d3 = require('d3');
import C = require('./main');
import vis = require('./vis');
import ranges = require('./range');
import datatypes = require('./datatype');
import provenance = require('./provenance');

class ProxyMetaData implements vis.IVisMetaData {
  constructor(private proxy : () => vis.IVisMetaData) {

  }

  get scaling() {
    var p = this.proxy();
    return p ? p.scaling : 'free';
  }

  get rotation() {
    var p = this.proxy();
    return p ? p.rotation : 0;
  }

  get sizeDependsOnDataDimension() {
    var p = this.proxy();
    return p ? p.sizeDependsOnDataDimension : [false, false];
  }
}

interface IMultiForm {
  visses: vis.IVisPluginDesc[];
  switchTo(index: number)  : C.IPromise<any>;
  switchTo(vis:vis.IVisPluginDesc) : C.IPromise<any>;
}


function toInitialVis(initial: any, visses: vis.IVisPluginDesc[]) {
  switch(typeof initial) {
  case 'number':
    return Math.max(0, Math.min(initial, visses.length - 1));
  case 'string':
    return Math.max(0, C.indexOf(visses, (v) => v.id === initial));
  default:
    return Math.max(0, visses.indexOf(initial));
  }
}

/**
 * a simple multi form class using a select to switch
 */
export class MultiForm extends vis.AVisInstance implements vis.IVisInstance, IMultiForm {
  parent:D3.Selection;
  node: Element;
  /**
   * list of all possibles vis techniques
   */
  visses:vis.IVisPluginDesc[];

  private actVis:vis.IVisInstance;
  private actVisPromise : C.IPromise<any>;

  private actDesc:vis.IVisPluginDesc;
  private $content:D3.Selection;

  private metaData_ : vis.IVisMetaData = new ProxyMetaData(() => this.actDesc);

  constructor(public data:datatypes.IDataType, parent:Element, private options : any = {}) {
    super();
    this.options = C.mixin({
      initialVis : 0
    }, options);
    this.parent = d3.select(parent).append('div').attr('class', 'multiform');
    this.node = this.parent.node();
    //find all suitable plugins
    this.visses = vis.list(data);

    this.build();
  }

  /**
   * converts this multiform to a vis metadata
   * @return {vis.IVisMetaData}
   */
  get asMetaData() {
    return this.metaData_;
  }


  private build() {
    var p = this.parent;
    //create select option field

    //create content
    this.$content = p.append('div').attr('class', 'content');
    //switch to first
    var initial = toInitialVis(this.options.initialVis, this.visses);
    this.switchTo(this.visses[initial]);
  }

  destroy() {
    if (this.actVis && C.isFunction(this.actVis.destroy)) {
      this.actVis.destroy();
    }
  }

  persist() : any {
    return {
      id: this.actDesc ? this.actDesc.id : null,
      content: this.actVis && C.isFunction(this.actVis.persist) ? this.actVis.persist() : null
    };
  }

  restore(persisted: any) {
    if (persisted.id) {
      var selected = C.search(this.visses, (e) => e.id === persisted.id);
      if (selected) {
        this.switchTo(selected).then((vis) => {
          if (vis && persisted.content && C.isFunction(vis.restore)) {
            vis.restore(persisted.content);
          }
        });
      }
    }
    return null;
  }

  locate() {
    var p = this.actVisPromise || C.resolved(null), args = C.argList(arguments);
    return p.then((vis) => {
      if (vis && C.isFunction(vis.locate)) {
        return vis.locate.apply(vis, args);
      } else {
        return C.resolved((arguments.length === 1 ? undefined : new Array(args.length)));
      }
    });
  }

  locateById() {
    var p = this.actVisPromise || C.resolved(null), args = C.argList(arguments);
    return p.then((vis) => {
      if (vis && C.isFunction(vis.locateById)) {
        return vis.locateById.apply(vis, args);
      } else {
        return C.resolved((arguments.length === 1 ? undefined : new Array(args.length)));
      }
    });
  }

  transform(scale?: number[], rotate? : number) {
    if (this.actVis) {
      if (arguments.length === 0) {
        return this.actVis.transform();
      } else {
        var t = (event, new_, old) => {
          this.fire('transform', new_, old);
        };
        this.actVis.on('transform', t);
        var r = this.actVis.transform(scale, rotate);
        this.actVis.off('transform', t);
        return r;
      }
    }
    return {
      scale: [1,1],
      rotate: 0
    };
  }

  /**
   * returns the current selected vis technique description
   * @returns {plugins.IPluginDesc}
   */
  get act() {
    return this.actDesc;
  }

  get size() {
    if (this.actVis) {
      return this.actVis.size;
    }
    return [100, 100];
  }

  get rawSize() {
    if (this.actVis) {
      return this.actVis.rawSize;
    }
    return [100, 100];
  }

  /**
   * switch to the desired vis technique given by index
   * @param index
   */
  switchTo(index: number)  : C.IPromise<any>;
  switchTo(vis:vis.IVisPluginDesc) : C.IPromise<any>;
  switchTo(param : any) : C.IPromise<any> {
    var vis: vis.IVisPluginDesc = null;
    if (typeof param === 'number') {
      if (param < 0 || param >= this.visses.length) {
        throw new RangeError('index ' + param + ' out of range: [0,' + this.visses.length + ']');
      }
      vis = this.visses[<number>param];
    } else {
      vis = <vis.IVisPluginDesc>param;
    }

    if (vis === this.actDesc) {
      return this.actVisPromise; //already selected
    }
    //gracefully destroy
    if (this.actVis) {
      this.actVis.destroy();
      this.actVis = null;
      this.actVisPromise = null;
    }
    //remove content dom side
    this.$content.selectAll('*').remove();

    //switch and trigger event
    var bak = this.actDesc;
    this.actDesc = vis;
    this.fire('change', vis, bak);
    this.actVis = null;
    this.actVisPromise = null;

    if (vis) {
      //load the plugin and create the instance
      return this.actVisPromise = vis.load().then((plugin:any) => {
        if (this.actDesc !== vis) { //changed in the meanwhile
          return null;
        }
        this.actVis = plugin.factory(this.data, this.$content.node());
        this.fire('changed', vis, bak);
        return this.actVis;
      });
    } else {
      return C.resolved(null);
    }
  }
}

class GridElem implements provenance.IPersistable {
  private actVis : vis.IVisInstance;
  $content : D3.Selection;

  constructor(public range: ranges.Range, public data: datatypes.IDataType) {
  }

  get hasOne() {
    return this.actVis != null;
  }

  destroy() {
    if (this.actVis && C.isFunction(this.actVis.destroy)) {
      this.actVis.destroy();
    }
  }

  get size(): number[] {
    return this.actVis ? this.actVis.size : [100, 100];
  }

  get rawSize(): number[] {
    return this.actVis ? this.actVis.rawSize : [100, 100];
  }

  persist() {
    return {
      range: this.range.toString(),
      content: this.actVis && C.isFunction(this.actVis.persist) ? this.actVis.persist() : null
    };
  }

  restore(persisted: any) {
    //FIXME
    /*if (persisted.id) {
      var selected = C.search(this.visses, (e) => e.id === persisted.id);
      if (selected) {
        this.switchTo(selected).then((vis) => {
          if (vis && persisted.content && C.isFunction(vis.restore)) {
            vis.restore(persisted.content);
          }
        });
      }
    }*/
    return null;
  }

  switchDestroy() {
    //remove content dom side
    this.$content.selectAll('*').remove();
    if (this.actVis && C.isFunction(this.actVis.destroy)) {
      this.actVis.destroy();
    }
    this.actVis = null;
  }

  build(plugin: any) {
    this.actVis = plugin.factory(this.data, this.$content.node());
    return this.actVis;
  }


  transform(scale?: number[], rotate? : number) {
    if (this.actVis) {
      if (arguments.length > 0) {
        return this.actVis.transform(scale, rotate);
      } else {
        return this.actVis.transform();
      }
    }
    return {
      scale: [1,1],
      rotate: 0
    };
  }
}
/**
 * a simple multi form class using a select to switch
 */
export class MultiFormGrid extends vis.AVisInstance implements vis.IVisInstance, IMultiForm {
  parent:D3.Selection;
  node: Element;
  /**
   * list of all possibles vis techniques
   */
  visses:vis.IVisPluginDesc[];

  private actDesc:vis.IVisPluginDesc;

  private actVisPromise : C.IPromise<any>;

  private $content:D3.Selection;

  private dims : ranges.Range1DGroup[][];
  private grid : GridElem[];

  private metaData_ : vis.IVisMetaData = new ProxyMetaData(() => this.actDesc);

  constructor(public data:datatypes.IDataType, public range: ranges.Range, parent:Element, viewFactory : (data:datatypes.IDataType, range : ranges.Range) => datatypes.IDataType, private options : any = {}) {
    super();
    this.options = C.mixin({
      initialVis : 0
    }, options);
    this.parent = d3.select(parent).append('div').attr('class', 'multiformgrid');
    this.node = this.parent.node();
    //find all suitable plugins
    this.visses = vis.list(data);

    //compute the dimensions and build the grid
    var dims = this.dims = range.dims.map((dim) => {
      if (dim instanceof ranges.CompositeRange1D) {
        return (<ranges.CompositeRange1D>dim).groups;
      } else if (dim instanceof ranges.Range1DGroup) {
        return [ <ranges.Range1DGroup>dim ];
      } else {
        return [ ranges.asUngrouped(dim) ];
      }
    });
    var grid = this.grid = [];
    function product(level: number, range : ranges.Range1D[]) {
      if (level === dims.length) {
        var r = range.length === 0 ? ranges.all() : ranges.list(range.slice()); //work on a copy for safety reason
        grid.push(new GridElem(r, viewFactory(data, r)));
      } else {
        dims[level].forEach((group) => {
          range.push(group);
          product(level + 1, range);
          range.pop();
        });
      }
    }
    product(0, []);

    this.build();
  }

  /**
   * converts this multiform to a vis metadata
   * @return {vis.IVisMetaData}
   */
  get asMetaData() {
    return this.metaData_;
  }

  private build() {
    var p = this.parent;
    //create select option field

    //create content
    this.$content = p;
    //create groups for all grid elems
    //TODO how to layout as a grid
    this.grid.forEach((elem) => elem.$content = p.append('div').attr('class', 'content'));
    //switch to first
    var initial = toInitialVis(this.options.initialVis, this.visses);
    this.switchTo(this.visses[initial]);
  }

  destroy() {
    this.grid.forEach((elem) => {
      elem.destroy();
    });
  }

  transform(scale?: number[], rotate? : number) {
    if (this.grid[0].hasOne) {
      var bak = this.grid[0].transform();
      if (arguments.length > 0) {
        this.grid.forEach((g) => g.transform(scale, rotate));
        this.fire('transform', {
          scale: scale,
          rotate: rotate
        }, bak);
      }
      return bak;
    }
    return {
      scale: [1,1],
      rotate: 0
    };
  }

  persist() : any {
    return {
      id: this.actDesc ? this.actDesc.id : null,
      contents: this.grid.map((elem) => elem.persist())
    };
  }

  restore(persisted: any) {
    if (persisted.id) {
      var selected = C.search(this.visses, (e) => e.id === persisted.id);
      if (selected) {
        this.switchTo(selected).then((vis) => {
          //FIXME
          if (vis && persisted.content && C.isFunction(vis.restore)) {
            vis.restore(persisted.content);
          }
        });
      }
    }
    return null;
  }

    private locateGroup(range : ranges.Range) {

      return C.resolved(undefined);
    }

  private locateGroupById(range : ranges.Range) {

    return C.resolved(undefined);
  }

  locate() {
    var p = this.actVisPromise || C.resolved(null), args = C.argList(arguments);
    return p.then((visses) => {
      if (!visses) {
        return C.resolved((arguments.length === 1 ? undefined : new Array(args.length)));
      }
      if (visses.length === 1) {
        return visses[0].locate.apply(visses[0], args);
      } else {
        //multiple groups
        if (arguments.length === 1) {
          return this.locateGroup(arguments[0]);
        } else {
          return C.all(args.map((arg) => this.locateGroup(arg)));
        }
      }
    });
  }

  locateById(...range:ranges.Range[]) {
    var p = this.actVisPromise || C.resolved(null), args = C.argList(arguments);
    return p.then((visses) => {
      if (!visses) {
        return C.resolved((arguments.length === 1 ? undefined : new Array(args.length)));
      }
      if (visses.length === 1) {
        return visses[0].locateById.apply(visses[0], args);
      } else {
        //multiple groups
        if (arguments.length === 1) {
          return this.locateGroupById(arguments[0]);
        } else {
          return C.all(args.map((arg) => this.locateGroupById(arg)));
        }
      }
    });
  }

  /**
   * returns the current selected vis technique description
   * @returns {plugins.IPluginDesc}
   */
  get act() {
    return this.actDesc;
  }

  gridSize(raw = false) : { cols: number[]; rows: number[]; grid: number[][][]} {
    var sizes = this.grid.map(raw ? (elem) => elem.rawSize : (elem) => elem.size);

    if (this.dims.length === 1) {
      //vertically groups only
      return {
        cols: [ <number>d3.max(sizes, (s) => s[0]) ],
        rows: sizes.map((s) => s[1]),
        grid: sizes.map((s) => [s])
      };
    } else { //if (this.dims.length === 2)
      var cols = this.dims[1].length;
      var grid = this.dims[0].map((row, i) => sizes.slice(i * cols, (i + 1) * cols));
      return {
        cols: this.dims[1].map((d, i) => <number>d3.max(grid, (row) => row[i][0])),
        rows: grid.map((row) => <number>d3.max(row, (s) => s[1])),
        grid: grid
      };
    }
  }

  get size() {
    var gridSize = this.gridSize();
    return [ d3.sum(gridSize.cols), d3.sum(gridSize.rows)];
  }

  get rawSize() {
    var gridSize = this.gridSize(true);
    return [ d3.sum(gridSize.cols), d3.sum(gridSize.rows)];
  }

  /**
   * switch to the desired vis technique given by index
   * @param index
   */
  switchTo(index: number)  : C.IPromise<any>;
  switchTo(vis:vis.IVisPluginDesc) : C.IPromise<any>;
  switchTo(param : any) : C.IPromise<any> {
    var vis: vis.IVisPluginDesc = null;
    if (typeof param === 'number') {
      if (param < 0 || param >= this.visses.length) {
        throw new RangeError('index '+param+ ' out of range: [0,'+this.visses.length+']');
      }
      vis = this.visses[<number>param];
    } else {
      vis = <vis.IVisPluginDesc>param;
    }

    if (vis === this.actDesc) {
      return this.actVisPromise; //already selected
    }

    //gracefully destroy
    this.grid.forEach((elem) => elem.switchDestroy());

    //switch and trigger event
    var bak = this.actDesc;
    this.actDesc = vis;
    this.fire('change', vis, bak);
    this.actVisPromise = null;

    if (vis) {
      //load the plugin and create the instance
      return this.actVisPromise = vis.load().then((plugin:any) => {
        if (this.actDesc !== vis) { //changed in the meanwhile
          return null;
        }
        var r = this.grid.map((elem) => {
          return elem.build(plugin);
        });
        this.fire('changed', vis, bak);
        return r;
      });
    } else {
      return C.resolved([]);
    }
  }
}

/**
 * adds everything to have an icon for the set of vis plugin descriptions
 * @param s
 */
function createIconFromDesc(s : D3.Selection) {
  s.each(function(d) {
    d.iconify(this);
  });
}

/**
 * computes the selectable vis techniques for a given set of multi form objects
 * @param forms
 * @return {*}
 */
export function toAvailableVisses(forms: IMultiForm[]) {
  if (forms.length === 0) {
    return [];
  } if (forms.length === 1) {
    return forms[0].visses;
  }
  //intersection of all
  return forms[0].visses.filter((vis) => forms.every((f) => f.visses.indexOf(vis) >= 0));
}

export function addIconVisChooser(toolbar: Element, ...forms: IMultiForm[]) {
  var $toolbar = d3.select(toolbar);
  var $s = $toolbar.insert('div','*');
  var visses = toAvailableVisses(forms);

  $s.selectAll('i').data(visses)
    .enter()
    .append('i')
    .call(createIconFromDesc)
    .on('click', (d) => {
      forms.forEach((f) => f.switchTo(d));
    });
}

export function addSelectVisChooser(toolbar: Element, ...forms: IMultiForm[]) {
  var $toolbar = d3.select(toolbar);
  var $s = $toolbar.insert('select','*');
  var visses = toAvailableVisses(forms);

  $s.selectAll('option').data(visses)
    .enter()
    .append('option')
    .attr('value', (d, i) => i)
    .text((d) => d.name);
  $s.on('change', function () {
    forms.forEach((f) => f.switchTo(visses[this.selectedIndex]));
  });
}

export function create(data:datatypes.IDataType, parent:Element, options?) {
  return new MultiForm(data, parent, options);
}

export function createGrid(data:datatypes.IDataType, range: ranges.Range, parent:Element, viewFactory : (data:datatypes.IDataType, range : ranges.Range) => datatypes.IDataType, options?) {
  return new MultiFormGrid(data, range, parent, viewFactory, options);
}
