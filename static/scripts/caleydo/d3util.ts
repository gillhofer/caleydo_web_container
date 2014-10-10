/**
 * Created by Samuel Gratzl on 08.10.2014.
 */
import C = require('./main');
import idtypes = require('./idtype');
import datatype = require('./datatype');
import d3 = require('d3');
'use strict';

/**
 * utility function to handle selections
 * @param data
 * @param $data
 * @param selector
 * @returns {function(any, any): undefined} the click handler
 */
export function selectionUtil(data: datatype.IDataType, $data : D3.Selection, selector : string) {
  var l = function (event, type, selected) {
    var all = $data.selectAll(selector);
    all.classed('select-' + type, false);
    var sub = selected.filter(all[0]);
    if (sub.length > 0) {
      d3.selectAll(sub).classed('select-' + type, true);
    }
  };
  data.on('select', l);
  C.onDOMNodeRemoved($data.node(), function () {
    data.off('select', l);
  });
  data.selections().then(function (selected) {
    l(null, 'selected', selected);
  });

  return (d, i) => {
    data.select(0, [i], idtypes.toSelectOperation(d3.event));
  }
}


