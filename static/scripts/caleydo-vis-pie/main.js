/**
 * Created by Samuel Gratzl on 08.10.2014.
 */
define(['exports', 'd3', '../caleydo/main', '../caleydo/idtype', '../caleydo/geom', '../caleydo-tooltip/main'], function (exports, d3, C, idtypes, geom, tooltip) {

  function Vis(data, parent, options) {
    this.data = data;
    this.options = C.mixin({
      radius: 50,
      innerRadius: 0
    }, options);
    this.parent = parent;
    this.node = this.build(d3.select(parent));
  }

  Vis.prototype.locate = function (range) {
    if (arguments.length === 1) {
      return this.locateImpl(range);
    }
    return C.all(C.argList(arguments).map(this.locateImpl, this));
  };

  function toPolygon(start, end, radius) {
    var r = [
      { x: radius, y: radius },
      { x: radius + Math.cos(start) * radius, y: radius + Math.sin(start) * radius },
      { x: radius + Math.cos(end) * radius, y: radius + Math.sin(end) * radius }
    ];
    //approximate by triangle
    if (end - start > Math.PI) { //more than 180 degree use one more point
      r.splice(2, 0, { x: radius + Math.cos((end - start) * 0.5) * radius, y: radius + Math.sin((end - start) * 0.5) * radius });
    }
    return geom.polygon(r);
  }

  Vis.prototype.locateImpl = function (range) {
    var that = this, o = this.options;
    if (range.isAll || range.isNone) {
      return C.resolved({ x: o.radius, y: o.radius, radius: o.radius});
    }
    return this.data.data(range).then(function (data) {
      var ex = d3.extent(data, function (value) {
        return that.hist.binOf(value);
      });
      var startAngle = that.scale(that.hist_data[ex[0]].start);
      var endAngle = that.scale(that.hist_data[ex[1]].end);
      return C.resolved(toPolygon(startAngle, endAngle, o.radius));
    });
  };

  Vis.prototype.build = function ($parent) {
    var o = this.options, that = this, data = this.data;
    var $svg = $parent.append("svg").attr({
      width: o.radius * 2,
      height: o.radius * 2,
      'class': 'pie'
    });
    var $base = $svg.append('g').attr('transform', 'translate(' + o.radius + ',' + o.radius + ')');
    var $data = $base.append('g');
    var $highlight = $base.append('g').style('pointer-events', 'none').classed('select-selected', true);

    var scale = that.scale = d3.scale.linear().range([0, 2 * Math.PI]);
    var arc = d3.svg.arc().innerRadius(o.innerRadius).outerRadius(o.radius)
      .startAngle(function (d) {
        return scale(d.start);
      })
      .endAngle(function (d) {
        return scale(d.end);
      });
    var cols = d3.scale.category10();

    var l = function (event, type, selected) {
      var highlights = that.hist_data.map(function (entry) {
        var s = entry.range.intersect(selected);
        return {
          start: entry.start,
          end: entry.start + s.size()[0]
        };
      }).filter(function (entry) {
        return entry.start < entry.end;
      });
      var $m = $highlight.selectAll('path').data(highlights);
      $m.enter().append('path');
      $m.exit().remove();
      $m.attr('d', arc);
    };
    data.on('select', l);
    C.onDOMNodeRemoved($data.node(), function () {
      data.off('select', l);
    });

    this.data.hist().then(function (hist) {
      that.hist = hist;
      var total = hist.count;
      scale.domain([0, total]);
      var hist_data = that.hist_data = [], prev = 0, cats = that.data.desc.value.categories;
      hist.forEach(function (b, i) {
        hist_data[i] = {
          name: (typeof cats[i] === 'string') ? cats[i] : cats[i].name,
          start: prev,
          size: b,
          ratio: b / total,
          end: prev + b,
          color: (cats[i].color === undefined) ? cols(i) : cats[i].color,
          range: hist.range(i)
        };
        prev += b;
      });
      var $m = $data.selectAll('path').data(hist_data);
      $m.enter()
        .append('path')
        .call(tooltip.bind(function (d) {
          return d.name + ' ' + (d.size) + ' entries (' + Math.round(d.ratio * 100) + '%)';
        }))
        .on('click', function (d) {
          data.select(0, d.range, idtypes.toSelectOperation(d3.event));
        });
      $m.attr('d', arc).attr('fill', function (d) {
        return d.color;
      });


      data.selections().then(function (selected) {
        l(null, 'selected', selected);
      });
    });

    return $svg.node();
  };
  exports.Pie = Vis;

  function create(data, parent, options) {
    return new Vis(data, parent, options);
  }

  exports.create = create;
});
