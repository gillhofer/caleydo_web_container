/**
 * Created by Samuel Gratzl on 27.08.2014.
 */

'use strict';
import d3 = require('d3');
import C = require('caleydo');
import plugins = require('caleydo-plugins');
import datatypes = require('caleydo-datatype');
import events = require('caleydo-events');

/**
 * a simple multi form class using a select to switch
 */
export class MultiForm extends events.EventHandler {
  parent:D3.Selection;
  /**
   * list of all possibles vis techniques
   */
  visses:plugins.IPluginDesc[];

  private actVis:any;

  private actDesc:plugins.IPluginDesc;
  private $content:D3.Selection;

  constructor(public data:datatypes.IDataType, parent:Element) {
    super();
    this.parent = d3.select(parent).append('div').attr('class', 'multiform');
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
    this.switchToImpl(this.visses[0]);
  }

  destroy() {
    if (this.actVis && C.isFunction(this.actVis.destroy)) {
      this.actVis.destroy();
    }
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
    if (d && typeof d.size === 'function') {
      s = d.size(this.data.dim);
    }
    return s;
  }

  /**
   * switch to the desired vis technique given by index
   * @param index
   */
  switchTo(index: number) {
    if (index < 0 || index >= this.visses.length){
      throw new RangeError('index '+index+ ' out of range: [0,'+this.visses.length+']');
    }
    this.switchToImpl(this.visses[index]);
  }

  private switchToImpl(vis:plugins.IPluginDesc) {
    if (vis === this.actDesc) {
      return; //already selected
    }
    //gracefully destroy
    if (this.actVis && C.isFunction(this.actVis.destroy)) {
      this.actVis.destroy();
      this.actVis = null;
    }
    //remove content dom side
    this.$content.selectAll('*').remove();

    //switch and trigger event
    var bak = this.actDesc;
    this.actDesc = vis;
    this.fire('change', [vis, bak]);
    this.actVis = null;

    if (vis) {
      //load the plugin and create the instance
      vis.load().then((plugin:any) => {
        this.actVis = plugin.factory(this.data, this.$content.node());
      });
    }
  }
}

export function addSimpleVisChooser(form: MultiForm, toolbar: Element) {
  var $toolbar = d3.select(toolbar);
  var $s = $toolbar.insert('select','*');
  $s.selectAll('option').data(form.visses)
    .enter()
    .append('option')
    .attr('value', (d, i) => i)
    .text((d) => {
      return d.name;
    });
  $s.on('change', function () {
    form.switchTo(this.selectedIndex);
  });
}

export function addSimpleVisIconChooser(form: MultiForm, toolbar: Element) {
  var $toolbar = d3.select(toolbar);
  var $s = $toolbar.insert('div','*');
  //create
  $s.selectAll('i').data(form.visses)
    .enter()
    .append('i')
    .attr('title', (d) => d.name)
    .attr('class', 'fa')
    .each(function(d) {
      var t = d3.select(this);
      if (d.iconcss) {
        t.classed(d.iconcss, true);
      } else if (d.icon) {
        t.classed('fa-fw', true).style('background-image', 'url(scripts/' + d.icon + ')').html('&nbsp');
      } else {
        t.text(d.name.substr(0, 1).toUpperCase());
      }
    })
    .on('click', (d, i) => {
      form.switchTo(i);
    });
  var l = (event: any, act: plugins.IPluginDesc, old: plugins.IPluginDesc) => {

  };
  form.on('change', l);
  C.onDOMNodeRemoved(toolbar, () => {
    form.off('change', l);
  });
}

export function create(data:datatypes.IDataType, parent:Element) {
  return new MultiForm(data, parent);
}