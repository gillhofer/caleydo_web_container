/**
 * Created by Samuel Gratzl on 27.08.2014.
 */

'use strict';
import d3 = require('d3');
import C = require('./main');
import plugins = require('./plugin');
import datatypes = require('./datatype');
import events = require('./event');

/**
 * a simple multi form class using a select to switch
 */
export class MultiForm extends events.EventHandler implements plugins.IVisInstance {
  parent:D3.Selection;
  node: Element;
  /**
   * list of all possibles vis techniques
   */
  visses:plugins.IPluginDesc[];

  private actVis:any;
  private actVisPromise : C.IPromise<any>;

  private actDesc:plugins.IPluginDesc;
  private $content:D3.Selection;

  constructor(public data:datatypes.IDataType, parent:Element) {
    super();
    this.parent = d3.select(parent).append('div').attr('class', 'multiform');
    this.node = this.parent.node();
    //find all suitable plugins
    this.visses = plugins.listVis(data);

    this.build();
  }

  private build() {
    var p = this.parent;
    //create select option field

    //create content
    this.$content = p.append('div').attr('class', 'content');
    //switch to first
    this.switchTo(this.visses[0]);
  }

  destroy() {
    if (this.actVis && C.isFunction(this.actVis.destroy)) {
      this.actVis.destroy();
    }
  }

  persist() {
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

  /**
   * returns the current selected vis technique description
   * @returns {plugins.IPluginDesc}
   */
  get act() {
    return this.actDesc;
  }

  get size() {
    var s = [200,200];
    var d : any = this.actDesc;
    if (d && C.isFunction(d.size)) {
      s = d.size(this.data.dim);
    } else if (d && C.isArray(d.size)) {
      s = d.size;
    }
    return s;
  }

  /**
   * switch to the desired vis technique given by index
   * @param index
   */
  switchTo(index: number)  : C.IPromise<any>;
  switchTo(vis:plugins.IPluginDesc) : C.IPromise<any>;
  switchTo(param : any) : C.IPromise<any> {
    var vis: plugins.IPluginDesc = null;
    if (typeof param === 'number') {
      if (param < 0 || param >= this.visses.length){
        throw new RangeError('index '+param+ ' out of range: [0,'+this.visses.length+']');
      }
      vis = this.visses[<number>param];
    } else {
      vis = <plugins.IPluginDesc>param;
    }

    if (vis === this.actDesc) {
      return this.actVisPromise; //already selected
    }
    //gracefully destroy
    if (this.actVis && C.isFunction(this.actVis.destroy)) {
      this.actVis.destroy();
      this.actVis = null;
      this.actVisPromise = null;
    }
    //remove content dom side
    this.$content.selectAll('*').remove();

    //switch and trigger event
    var bak = this.actDesc;
    this.actDesc = vis;
    this.fire('change', [vis, bak]);
    this.actVis = null;
    this.actVisPromise = null;

    if (vis) {
      //load the plugin and create the instance
      return this.actVisPromise = vis.load().then((plugin:any) => {
        if (this.actDesc !== vis) { //changed in the meanwhile
          return null;
        }
        this.actVis = plugin.factory(this.data, this.$content.node());
        return this.actVis;
      });
    } else {
      return C.resolved(null);
    }
  }
}

/**
 * adds everythign to have an icon for the set of vis plugin descriptions
 * @param s
 */
function createIconFromDesc(s : D3.Selection) {
  s.attr('title', (d) => d.name)
    .attr('class', 'fa')
    .each(function (d) {
      var t = d3.select(this);
      if (d.iconcss) { //defined by css
        t.classed(d.iconcss, true);
      } else if (d.icon) { //defined by background icon
        t.classed('fa-fw', true).style('background-image', 'url(' + d.baseUrl + '/' + d.icon + ')').html('&nbsp');
      } else { //use the first letter
        t.text(d.name.substr(0, 1).toUpperCase());
      }
    });
}

/**
 * computes the selectable vis techniques for a given set of multi form objects
 * @param forms
 * @return {*}
 */
function toAvailableVisses(forms: MultiForm[]) {
  if (forms.length === 0) {
    return [];
  } if (forms.length === 1) {
    return forms[0].visses;
  }
  //intersection of all
  return forms[0].visses.filter((vis) => forms.every((f) => f.visses.indexOf(vis) >= 0))
}

export function addIconVisChooser(toolbar: Element, ...forms: MultiForm[]){
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

export function addSelectVisChooser(toolbar: Element, ...forms: MultiForm[]){
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

export function create(data:datatypes.IDataType, parent:Element) {
  return new MultiForm(data, parent);
}
