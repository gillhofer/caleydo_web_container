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
    var $s = p.append('select');
    var that = this;
    $s.selectAll('option').data(this.visses)
      .enter()
      .append('option')
      .attr('value', (d, i) => i)
      .text((d) => {
        return d.name;
      });
    $s.on('change', function () {
      that.switchTo(this.selectedIndex);
    });
    //create content
    this.$content = p.append('div').attr('class', 'content');
    //switch to first
    this.switchToImpl(this.visses[0]);
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
    s[1] += 30;
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

export function create(data:datatypes.IDataType, parent:Element) {
  return new MultiForm(data, parent);
}