/**
 * Created by Samuel Gratzl on 15.12.2014.
 */
import d3 = require('d3');
import events = require('../caleydo/event');
import idtypes = require('../caleydo/idtype');
import ranges = require('../caleydo/range');
import C = require('../caleydo/main');

class SelectionIDType {
  private l = (event, type: string, selection: ranges.Range) => {
    this.update(type, selection);
  };
  private $div: D3.Selection;
  private $ul : D3.Selection;

  constructor(public idType: idtypes.IDType, parent: D3.Selection) {
    idType.on('select', this.l);
    this.$div = parent.append('div');
    this.$div.append('span').text(idType.name);
    this.$ul = this.$div.append('ul');
    this.update(idtypes.defaultSelectionType, idType.selections());
  }

  private update(type: string, selection: ranges.Range) {
    this.$div.classed('no-selection', selection.isNone);
    if (selection.isNone) {
      this.$ul.selectAll('*').remove();
      return;
    }
    var $li = this.$ul.selectAll('li').data(selection.dim(0).iter().asList());
    $li.enter().append('li').classed('select-' + type, true);
    $li.exit().remove();
    $li.text(C.identity);
  }

  destroy() {
    this.idType.off('select', this.l);
  }
}

/**
 * selection info shows a div for each id type and a list of all selected ids in it
 */
export class SelectionInfo {
  private options:any;
  private $div : D3.Selection;
  private handler : SelectionIDType[] = [];
  private listener = (event, idtype) => {
    this.handler.push(new SelectionIDType(idtype, this.$div));
  };

  constructor(public parent:HTMLElement, options = {}) {
    this.options = C.mixin({}, options);
    this.build(d3.select(parent));
  }


  private build(parent:D3.Selection) {
    var $div = this.$div = parent.append('div').classed('selectioninfo', true);
    C.onDOMNodeRemoved($div.node(), this.destroy, this);

    events.on('register.idtype', this.listener);
    idtypes.list().forEach((d) => {
      this.listener(null, d);
    });
  }

  private destroy() {
    events.off('register.idtype', this.listener);
    this.handler.forEach((h) => h.destroy());
    this.handler.length = 0;
  }
}

export function create(parent, options) {
  return new SelectionInfo(parent, options);
}
