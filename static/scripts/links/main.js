/**
* Created by Samuel Gratzl on 05.08.2014.
*/
/// <reference path="../../../tsd.d.ts" />
define(["require", "exports", 'd3', '../caleydo/range', '../caleydo/caleydo'], function(require, exports, d3, ranges, C) {
    var _id = 0, line = d3.svg.line().x(function (d) {
        return d.x;
    }).y(function (d) {
        return d.y;
    });
    function nextID() {
        return _id++;
    }

    function selectCorners(a, b) {
        var ac = a.aabb(), bc = b.aabb();
        if (ac.cx > bc.cx) {
            return ['w', 'e'];
        } else {
            return ['e', 'w'];
        }
        //TODO better
    }

    var LinksRenderer = (function () {
        function LinksRenderer(parent) {
            this.visses = [];
            this.observing = d3.map();
            this.$parent = d3.select(parent);
            this.$div = this.$parent.append('div').attr({
                'class': 'layer layer1 links'
            });
            this.$svg = this.$div.append("svg").attr({
                width: '100%',
                height: '100%'
            });
        }
        LinksRenderer.prototype.register = function (idtype) {
            var that = this;
            function l() {
                that.update(idtype);
            }

            idtype.on('select', l);
            return {
                idtype: idtype,
                l: l,
                visses: [],
                push: function (vis, dimension) {
                    this.visses.push({ vis: vis, dim: dimension, id: nextID() });
                },
                remove: function (vis) {
                    var i, v = this.visses;
                    for (i = v.length - 1; i >= 0; --i) {
                        if (v[i].vis === vis) {
                            v.splice(i, 1);
                        }
                    }
                }
            };
        };

        LinksRenderer.prototype.unregister = function (entry) {
            var idtype = entry.idtype;
            idtype.off('select', entry.l);
        };

        LinksRenderer.prototype.push = function (vis) {
            var _this = this;
            this.visses.push(vis);
            var observing = this.observing;

            //register to all idtypes
            vis.data.idtypes.forEach(function (idtype, i) {
                if (observing.has(idtype.name)) {
                    observing.get(idtype.name).push(vis, i);
                } else {
                    var r = _this.register(idtype);
                    r.push(vis, i);
                    observing.set(idtype.name, r);
                    _this.updateIDTypes();
                }
            });
            this.update();
        };

        LinksRenderer.prototype.remove = function (vis) {
            var _this = this;
            var i = this.visses.indexOf(vis);
            if (i >= 0) {
                this.visses.splice(i, 1);
            }
            var observing = this.observing;
            vis.data.idtypes.forEach(function (idtype) {
                var r = observing.get(idtype.name);
                r.remove(vis);
                if (r.visses.length === 0) {
                    _this.unregister(r);
                    observing.remove(idtype.name);
                    _this.updateIDTypes();
                }
            });
            this.update();
        };

        LinksRenderer.prototype.update = function (idtype) {
            function prepareCombinations(entry, $group) {
                var combinations = [];
                var l = entry.visses.length, i, j, a, b;
                for (i = 0; i < l; ++i) {
                    a = entry.visses[i].id;
                    for (j = 0; j < i; ++j) {
                        b = entry.visses[j].id;
                        combinations.push(Math.min(a, b) + '-' + Math.max(a, b));
                    }
                }
                var $combi = $group.selectAll('g').data(combinations);
                $combi.enter().append('g');
                $combi.exit().remove();
                $combi.attr('data-id', C.identity);
            }

            function createLinks(existing, id, locs, $group) {
                if (existing.length === 0) {
                    return;
                }
                existing.forEach(function (ex) {
                    var swap = id > ex.id;
                    var group = Math.min(id, ex.id) + '-' + Math.max(id, ex.id);
                    var $g = $group.select('g[data-id="' + group + '"]');
                    var links = [];
                    locs.forEach(function (loc, i) {
                        if (loc && ex.locs[i]) {
                            var cs = selectCorners(loc, ex.locs[i]);
                            var r = [loc.corner(cs[0]), ex.locs[i].corner(cs[1])];
                            links.push(swap ? r.reverse() : r);
                        }
                    });
                    var $links = $g.selectAll('path').data(links);
                    $links.enter().append('path').attr('class', 'select-selected');
                    $links.exit().remove();
                    $links.attr('d', function (d) {
                        return line(d);
                    });
                });
            }

            function addLinks(entry) {
                if (entry.visses.length <= 1) {
                    return;
                }

                //collect all links
                var selected = entry.idtype.selections();
                var $group = this.$svg.select('g[data-idtype="' + entry.idtype.name + '"]');
                if (selected.isNone) {
                    $group.selectAll('*').remove();
                    return;
                }
                console.log(entry.idtype.name, selected.toString());

                //prepare groups for all combinations
                prepareCombinations(entry, $group);

                //load and find the matching locations
                var loaded = [];
                entry.visses.forEach(function (entry) {
                    var id = entry.id;
                    entry.vis.data.ids().then(function (ids) {
                        var dim = ids.dim(entry.dim);
                        var locations = [], tolocate = [];
                        selected.dim(0).iter().forEach(function (id) {
                            var mapped = dim.indexOf(id);
                            if (mapped < 0) {
                                locations.push(-1);
                            } else {
                                locations.push(tolocate.length);
                                tolocate.push(ranges.list(mapped));
                            }
                        });
                        if (tolocate.length === 0) {
                            //no locations at all
                            return;
                        }

                        //at least one mapped location
                        entry.vis.locate.apply(entry.vis, tolocate).then(function (located) {
                            var fulllocations;
                            if (tolocate.length === 1) {
                                fulllocations = locations.map(function (index) {
                                    return index < 0 ? undefined : located;
                                });
                            } else {
                                fulllocations = locations.map(function (index) {
                                    return located[index];
                                });
                            }
                            createLinks(loaded, id, fulllocations, $group);
                            loaded.push({ id: id, locs: fulllocations });
                        });
                    });
                });
            }

            if (idtype) {
                addLinks.call(this, this.observing.get(idtype.name));
            } else {
                this.observing.values().forEach(addLinks, this);
            }
        };

        LinksRenderer.prototype.updateIDTypes = function () {
            var $g = this.$svg.selectAll('g').data(this.observing.values());
            $g.enter().append('g');
            $g.exit().remove();
            $g.attr('data-idtype', function (d) {
                return d.idtype.name;
            });
        };
        return LinksRenderer;
    })();
    exports.LinksRenderer = LinksRenderer;
    function create(parent) {
        return new LinksRenderer(parent);
    }
    exports.create = create;
});
//# sourceMappingURL=main.js.map
