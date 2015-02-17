/**
 * Created by Christian on 11.12.2014.
 */
require(['jquery', 'd3', '../caleydo/main', '../caleydo/data', '../caleydo/plugin', '../caleydo-window/main', '../caleydo/d3util'], function ($, d3, C, data, plugins, window, utils) {
    'use strict';

    //var jsonPaths = require('./testpaths1.json');


    var sortingStrategies = {
      pathLength: function (a, b) {
        return d3.descending(a.edges.length, b.edges.length);
      }
    }

    var currentSortingStrategy = sortingStrategies.pathLength;

    var pathListeners = {
      listeners: [],

      add: function (listener) {
        this.listeners.push(listener);
      },

      notify: function (path) {
        this.listeners.forEach(function (listener) {
          listener(path);
        });
      }

    };

    var allPaths = [];

    $(document).ready(function () {

        var w = 800;
        var h = 800;

        var selectPaths = $('<select>').prependTo('div.outer')[0];

        $(selectPaths).append($("<option value='testpaths1.json'>20 paths from node 1800 to node 1713</option>"));
        $(selectPaths).append($("<option value='testpaths2.json'>50 paths from node 1800 to node 1713</option>"));
        $(selectPaths).append($("<option value='testpaths3.json'>50 paths from node 5 to node 9999</option>"));
        $(selectPaths).append($("<option value='testpaths4.json'>20 paths from node 780 to node 5395</option>"));
        $(selectPaths).on("change", function () {
          $.getJSON(this.value, function (paths) {
            loadPaths(paths);
          });

        });

        var svg = d3.select("#pathlist").append("svg")
        svg.attr("width", w)
          .attr("height", h);
        svg.append("marker")
          .attr("id", "arrowRight")
          .attr("viewBox", "0 0 10 10")
          .attr("refX", "0")
          .attr("refY", "5")
          .attr("markerUnits", "strokeWidth")
          .attr("markerWidth", "4")
          .attr("markerHeight", "3")
          .attr("orient", "auto")
          .append("path")
          .attr("d", "M 0 0 L 10 5 L 0 10 z");

        var sortButton = $('<input>').prependTo('div.outer')[0];
        $(sortButton).attr("type", "checkbox");
        $(sortButton).on("click", function () {
          var that = this;
          sortPaths(svg, function (a, b) {
            if (that.checked) {
              return d3.descending(a.edges.length, b.edges.length);
            }
            return d3.ascending(a.edges.length, b.edges.length);
          });
        });

        var svg2 = d3.select("#pathgraph").append("svg")
        svg2.attr("width", w)
          .attr("height", h);
        svg2.append("marker")
          .attr("id", "arrowRight")
          .attr("viewBox", "0 0 10 10")
          .attr("refX", "0")
          .attr("refY", "5")
          .attr("markerUnits", "strokeWidth")
          .attr("markerWidth", "4")
          .attr("markerHeight", "3")
          .attr("orient", "auto")
          .append("path")
          .attr("d", "M 0 0 L 10 5 L 0 10 z");
        //  //<marker id="triangle"
        //  //viewBox="0 0 10 10" refX="0" refY="5"
        //  //markerUnits="strokeWidth"
        //  //markerWidth="4" markerHeight="3"
        //  //orient="auto">
        //  //<path d="M 0 0 L 10 5 L 0 10 z" />
        //  //</marker>
        //
        //  $.ajax({
        //
        //    // The 'type' property sets the HTTP method.
        //    // A value of 'PUT' or 'DELETE' will trigger a preflight request.
        //    //type: 'POST',
        //    type: 'GET',
        //
        //    // The URL to make the request to.
        //    url: 'http://localhost:7474/db/data/',
        //    //url: 'http://localhost:7474/db/data/ext/FindShortestPath/graphdb/get_shortest_path',
        //
        //    accepts: 'application/json',
        //
        //    success: function (response) {
        //      d3.select("body").append("p").text(response);
        //    },
        //
        //    error: function (response) {
        //      var x = 2
        //    }
        //  });

        //console.time("time")
        //
        //$.ajax({
        //
        //  // The 'type' property sets the HTTP method.
        //  // A value of 'PUT' or 'DELETE' will trigger a preflight request.
        //  //type: 'POST',
        //  type: 'POST',
        //
        //  // The URL to make the request to.
        //  //url: 'http://localhost:7474/db/data/ext/KShortestPaths/graphdb/kShortestPaths',
        //  url: '/api/pathway/setinfo',
        //
        //  accepts: 'application/json',
        //
        //  // The 'contentType' property sets the 'Content-Type' header.
        //  // The JQuery default for this property is
        //  // 'application/x-www-form-urlencoded; charset=UTF-8', which does not trigger
        //  // a preflight. If you set this value to anything other than
        //  // application/x-www-form-urlencoded, multipart/form-data, or text/plain,
        //  // you will trigger a preflight request.
        //  contentType: 'application/json',
        //  data: "{\"sets\":[\"hsa00310\", \"hsa00330\"]}",
        //
        //  //data: '{"source":"http://localhost/:7474/db/data/node/15991", ' +
        //  //'"target":"http://localhost/:7474/db/data/node/1713", ' +
        //  //'"k":"3", ' +
        //  //'"costFunction":"function getCost(properties) {return 1.0}", ' +
        //  //'"ignoreDirection":"false"}',
        //  //data: '{"node_from": "/node/116", "node_to": "/node/92", "relationship_types": ["PATHWAY_EDGE"], "relationship_costs": [1.0], "only_one_route": true, "soft_timeout": 5000, "max_cost": 1000000.0 }',
        //
        //  //xhrFields: {
        //  // The 'xhrFields' property sets additional fields on the XMLHttpRequest.
        //  // This can be used to set the 'withCredentials' property.
        //  // Set the value to 'true' if you'd like to pass cookies to the server.
        //  // If this is enabled, your server must respond with the header
        //  // 'Access-Control-Allow-Credentials: true'.
        //  //withCredentials: false
        //  //},
        //
        //  //headers: {
        //  // Set any custom headers here.
        //  // If you set any non-simple headers, your server must include these
        //  // headers in the 'Access-Control-Allow-Headers' response header.
        //  //},
        //
        //  success: function (response) {
        //
        //    console.timeEnd("time")
        //    var paths = JSON.parse(response);
        //
        //    //var strp = paths.toString();
        //
        //    loadPaths(paths);
        //
        //    //if (paths.length > 0) {
        //    //
        //    //  renderPaths(svg, paths);
        //    //
        //    //  var firstPath = paths[0];
        //    //  var firstNode = firstPath.nodes[0];
        //    //  var lastNode = firstPath.nodes[firstPath.nodes.length - 1];
        //    //
        //    //  var pathGraph = getGraphFromPaths(paths);
        //    //
        //    //  renderGraph(svg2, pathGraph, firstNode, lastNode);
        //    //}
        //  },
        //
        //  error: function (response) {
        //    // Here's where you handle an error response.
        //    // Note that if the error was due to a CORS issue,
        //    // this function will still fire, but there won't be any additional
        //    // information about the error.
        //    var x = 2
        //  }
        //});

        //$.ajax({
        //  type: 'GET',
        //  url: '/api/pathway/summary',
        //  accepts: 'application/json',
        //
        //  success: function (response) {
        //
        //    var summaryData = JSON.parse(response);
        //
        //    d3.selectAll("body p")
        //      .data(summaryData)
        //      .enter()
        //      .append("p")
        //      .text(function (d) {
        //        return d[0].toString() + ": " + d[1].toString();
        //      });
        //  },
        //
        //  error: function (response) {
        //  }
        //});

        //$.getJSON("/api/pathway/setinfo", {sets:"tololo"}, function (paths) {
        //  loadPaths(paths);
        //} );

        $.getJSON("testpaths1.json", function (paths) {
          loadPaths(paths);
        });

        function loadPaths(paths) {

          for (var i = 0; i < paths.length; i++) {
            paths[i].id = i;
          }

          pathListeners.listeners = [];
          allPaths = paths;

          if (paths.length > 0) {

            displayPaths(svg, paths);

            var firstPath = paths[paths.length - 1];
            var firstNode = firstPath.nodes[0];
            var lastNode = firstPath.nodes[firstPath.nodes.length - 1];

            var pathGraph = getGraphFromPaths(paths);

            renderGraph(svg2, pathGraph, firstPath);
          }
        }


        //var propertyCosts = {
        //  size: {
        //    big: 2.0,
        //    small: 1.0
        //  },
        //  mood: {
        //    good: 2.0,
        //    bad: 1.0
        //  }
        //};
        //
        //var myCost = getCost([["size", "big"], ["mood", "bad"]]);
        //d3.select("body").append("p").text(myCost);
        //
        //function getCost(properties) {
        //  var totalCost = 1.0;
        //  properties.forEach(function (propObject) {
        //    var property = propObject[0];
        //    var value = propObject[1];
        //    var propDef = propertyCosts[property];
        //    if (typeof propDef != "undefined") {
        //      var cost = propDef[value];
        //      if (typeof cost != "undefined") {
        //        totalCost += cost;
        //      }
        //    }
        //  });
        //  return totalCost;
        //}

      }
    )
    ;

    //$.get("/api/pathway/path", function (resp) {
    //
    //  var paths = JSON.parse(resp);
    //
    //  renderPaths(svg, paths);
    //  //$('<h1>' + resp + '</h1>').appendTo('body');
    //});


    function renderGraph(svg, graph, fixedPath) {

      var w = 800;
      var h = 800;
      var nodeWidth = 50;
      var nodeHeight = 20;
      var sideSpacing = 10;
      var arrowWidth = 7;

      svg.selectAll("g.edgeGroup")
        .remove();
      svg.selectAll("g.nodeGroup")
        .remove();

      var force = d3.layout.force()
        .nodes(graph.nodes)
        .links(graph.edges)
        .size([w, h])
        //.linkDistance(300)
        .charge(-3000)
        .start();

      var edgeGroup = svg.append("g")
        .attr("class", "edgeGroup");

      var edge = edgeGroup.selectAll("g.edge")
        .data(graph.edges)
        .enter()
        .append("g")
        .attr("class", "edge");

      var edgeLines = edge.append("line")
        .attr("marker-end", "url(#arrowRight)");

      var nodeGroup = svg.append("g")
        .attr("class", "nodeGroup");

      var node = nodeGroup.selectAll("g.node")
        .data(graph.nodes)
        .enter()
        .append("g")
        .attr("class", function (d) {
          return "node " + (d.fixed ? ("fixed") : "");
        });

      var nodeRects = node.append("rect")
        .attr("width", nodeWidth)
        .attr("height", nodeHeight);

      var nodeTexts = node.append("text")
        .text(function (d) {
          var text = d.properties["name"];
          if (text.length > 7) {
            text = text.substring(0, 7);
          }
          return text;
        });


      var tick = function () {

        graph.nodes.forEach(function (node) {

          if (node.fixed) {
            node.x++;
          }


          if (node.x + nodeWidth / 2 > w) {
            node.x = w - nodeWidth / 2;
          }
          if (node.y + nodeHeight / 2 > h) {
            node.y = h - nodeHeight / 2;
          }
          if (node.x - nodeWidth / 2 < 0) {
            node.x = nodeWidth / 2;
          }
          if (node.y - nodeHeight / 2 < 0) {
            node.y = nodeHeight / 2;
          }
        });

        nodeRects.attr("x", function (d) {
          return d.x - nodeWidth / 2;
          //}
        });
        nodeRects.attr("y", function (d) {
          return d.y - nodeHeight / 2;

        });

        nodeTexts.attr("x", function (d) {
          return d.x;
        });
        nodeTexts.attr("y", function (d) {
          return d.y + 5;
        });

        edgeLines.attr("x1", function (d) {
          return calcIntersectionX(d.source, d.target, nodeWidth, nodeHeight);
        })
          .attr("y1", function (d) {
            return calcIntersectionY(d.source, d.target, nodeWidth, nodeHeight);
          })
          .attr("x2", function (d) {
            return calcIntersectionX(d.target, d.source, nodeWidth, nodeHeight);
          })
          .attr("y2", function (d) {
            return calcIntersectionY(d.target, d.source, nodeWidth, nodeHeight);
          });
      }

      force.on("tick", tick);


      pathListeners.add(function (path) {

        var nodeStep = (w - 2 * (sideSpacing + nodeWidth / 2)) / (path.nodes.length - 1);
        var posX = sideSpacing + nodeWidth / 2;
        var posY = h / 2;
        graph.nodes.forEach(function (node) {
          node.fixed = false;
        });

        //var nodeRangeDict = {};


        //for (var i = 0; i <= 100; i++) {
        //
        //  var scale = i / 100;

        path.nodes.forEach(function (fixedNode) {
          graph.nodes.forEach(function (node) {
            if (node.id == fixedNode.id) {

              //if (i === 0) {
              //  nodeRangeDict[node.id.toString()] = {startX: node.x, endX: posX, startY: node.y, endY: posY};
              //  node.fixed = true;
              //  posX += nodeStep;
              //} else {
              //
              //  var ranges = nodeRangeDict[node.id.toString()];
              //
              //  var vX = ranges.startX + scale * (ranges.endX - ranges.startX);
              //  node.x = vX;
              //  node.px = vX;
              //  //delete node.px;
              //  var vY = ranges.startY + scale * (ranges.endY - ranges.startY);
              //  node.y = vY;
              //  node.py = vY;

              node.x = posX;
              node.px = posX;
              //delete node.px;
              node.y = posY;
              node.py = posY;
              node.fixed = true;
              posX += nodeStep;
              //delete node.py;

            }
          });
        });
        //tick();
        //}
        nodeGroup.selectAll("g.node")
          .attr("class", function (d) {
            return "node " + (d.fixed ? ("fixed") : "");
          });

        force.start();
        //for(var i = 0; i < 200; i++) tick();
        //force.stop();

      });

    }

    function calcIntersectionX(source, target, nodeWidth, nodeHeight) {
      if (source.x === target.x) {
        return source.x;
      } else if (source.y === target.y) {
        if (source.x < target.x) {
          return source.x + nodeWidth / 2;
        } else {
          return source.x - nodeWidth / 2;
        }
      }

      var vector = {x: target.x - source.x, y: target.y - source.y};

      var vecRatio = Math.abs(vector.x / vector.y);
      var boxRatio = nodeWidth / nodeHeight;

      if (source.x < target.x) {
        //if (d.source.y < d.target.y) {
        if (boxRatio > vecRatio) {
          return source.x + nodeHeight / 2 * vecRatio;
        } else {
          return source.x + nodeWidth / 2;
        }
        //} else {
        //  if (boxRatio > vecRatio) {
        //    return d.source.x + nodeHeight / 2 * vecRatio;
        //  } else {
        //    return d.source.x + nodeWidth / 2;
        //  }
      } else {
        if (boxRatio > vecRatio) {
          return source.x - nodeHeight / 2 * vecRatio;
        } else {
          return source.x - nodeWidth / 2;
        }
      }
    }

    function calcIntersectionY(source, target, nodeWidth, nodeHeight) {
      if (source.x === target.x) {
        if (source.y < target.y) {
          return source.y + nodeHeight / 2;
        } else {
          return source.y - nodeHeight / 2;
        }
      } else if (source.y === target.y) {
        return source.y;
      }

      var vector = {x: target.x - source.x, y: target.y - source.y};

      var vecRatio = Math.abs(vector.x / vector.y);
      var boxRatio = nodeWidth / nodeHeight;

      if (source.y < target.y) {
        //if (d.source.y < d.target.y) {
        if (boxRatio > vecRatio) {
          return source.y + nodeHeight / 2;
        } else {
          return source.y + (nodeWidth / 2 * 1 / vecRatio);
        }
        //} else {
        //  if (boxRatio > vecRatio) {
        //    return d.source.x + nodeHeight / 2 * vecRatio;
        //  } else {
        //    return d.source.x + nodeWidth / 2;
        //  }
      } else {
        if (boxRatio > vecRatio) {
          return source.y - nodeHeight / 2;
        } else {
          return source.y - (nodeWidth / 2 * 1 / vecRatio);
        }
      }
    }


    function getGraphFromPaths(paths) {

      var nodeMap = {};
      var nodeList = [];

      var edgeMap = {};
      var edgeList = [];

      var nodeIndex = 0;
      paths.forEach(function (path) {
          path.nodes.forEach(function (node) {

            var index = nodeMap[node.id.toString()];

            if (typeof index == "undefined") {
              nodeMap[node.id.toString()] = nodeIndex;
              nodeList.push(node);
              nodeIndex++;
            }
          });

          path.edges.forEach(function (edge) {
            var e = edgeMap[edge.id.toString()];

            if (typeof e == "undefined") {

              var sourceNodeIndex = nodeMap[edge.sourceNodeId];
              if (typeof sourceNodeIndex != "undefined") {

                var targetNodeIndex = nodeMap[edge.targetNodeId];
                if (typeof targetNodeIndex != "undefined") {
                  edgeMap[edge.id.toString()] = edge;
                  edgeList.push({
                    source: sourceNodeIndex,
                    target: targetNodeIndex,
                    edge: edge
                  });
                }
              }
            }
          });

        }
      );

      return {nodes: nodeList, edges: edgeList};
    }

    function sortPaths(svg, sortingStrategy) {

      var pathHeight = 50;
      var setHeight = 10;

      allPaths.sort(sortingStrategy);

      svg.selectAll("g.path")
        .sort(sortingStrategy)
        .transition()
        .duration(500)
        .attr("transform", function (d, i) {
          var posY = 0;
          for (var index = 0; index < i; index++) {
            posY += pathHeight + allPaths[index].sets.length * setHeight;
          }
          return "translate(0," + posY + ")";
        })
    }


    function displayPaths(svg, paths) {

      var totalHeight = 0;
      var pathHeight = 50;
      var setHeight = 10;

      var allSets = [];
      var setDict = {};

      paths.forEach(function (path) {
        addPathSets(path);
        totalHeight += pathHeight

        path.sets.forEach(function (s) {
          var setExists = setDict[s.id];
          totalHeight += setHeight;
          if (!setExists) {
            allSets.push(s.id);
            setDict[s.id] = true;
          }
        });

      });

      renderPaths(svg, paths);


      //paths.forEach(function (path) {
      //  var p = svg.append("g");
      //  p.attr("class", "path")
      //    .on("click", function () {
      //      pathListeners.notify(path);
      //    });
      //
      //  addPathSets(path);
      //  renderPath(p, path, posX, posY);
      //  posY += 50 + path.sets.length * 10;
      //
      //  path.sets.forEach(function (s) {
      //    var setExists = setDict[s.id];
      //    if (!setExists) {
      //      allSets.push(s.id);
      //      setDict[s.id] = true;
      //    }
      //  });
      //});

      svg.attr("height", totalHeight);

      $.ajax({
        type: 'POST',
        url: '/api/pathway/setinfo',
        accepts: 'application/json',
        contentType: 'application/json',
        data: JSON.stringify(allSets),
        success: function (response) {

          var setInfos = JSON.parse(response);
          updateSets(svg, setInfos);
        }
      });
    }

    function updateSets(svg, setInfo) {
      svg.selectAll("g.path g.setGroup g.set text")
        .text(function (d) {
          var info = setInfo["path:" + d[0].id];

          if (typeof info === "undefined") {
            return getClampedText(d[0].id, 15);
          }

          var text = info.properties["name"];
          return getClampedText(text, 15);
        });

      svg.selectAll("g.path g.setGroup g.set title")
        .text(function (d) {
          var info = setInfo["path:" + d[0].id];

          if (typeof info === "undefined") {
            return d[0].id;
          }
          return info.properties["name"];
        });
    }

    function getClampedText(text, maxLength) {
      if (text.length > maxLength) {
        return text.substring(0, maxLength);
      }
      return text;
    }

    function addPathSets(path) {
      var setDict = {};
      var setList = [];

      for (var i = 0; i < path.edges.length; i++) {
        var edge = path.edges[i];
        edge.properties["pathways"].forEach(function (pathwayId) {

          var mySet = setDict[pathwayId];
          if (typeof mySet == "undefined") {
            mySet = {id: pathwayId, relIndices: [i]};
            setDict[pathwayId] = mySet;
            setList.push(mySet);
          } else {
            mySet.relIndices.push(i);
          }
        });
      }

      path.sets = setList;
    }

    //function renderPaths(svg, paths) {
    //  var pathHeight = 50;
    //  var nodeStart = 90;
    //  var nodeWidth = 50;
    //  var nodeHeight = 20;
    //  var vSpacing = 10;
    //  var edgeSize = 50;
    //  var arrowWidth = 7;
    //  var setHeight = 10;
    //
    //  svg.selectAll("g.path")
    //    .remove();
    //
    //  var p = svg.selectAll("g.path")
    //    .data(paths)
    //    .enter()
    //    .append("g");
    //
    //  p.attr("class", "path")
    //    .on("click", function (d) {
    //      pathListeners.notify(d);
    //    });
    //
    //  var nodeGroup = p.append("g")
    //    .attr("class", "nodeGroup");
    //
    //  var node = nodeGroup.selectAll("g.node")
    //    .data(function (path, i) {
    //      return path.nodes.map(function (node) {
    //        return [node, i];
    //      });
    //    })
    //    .enter()
    //    .append("g")
    //    .attr("class", "node");
    //  node.append("rect")
    //    .attr("x", function (d, i) {
    //      return nodeStart + (i * nodeWidth) + (i * edgeSize);
    //    })
    //    .attr("y", function (d) {
    //      var posY = vSpacing;
    //      for (var i = 0; i < d[1]; i++) {
    //        posY += pathHeight + paths[i].sets.length * setHeight;
    //      }
    //
    //      return posY;
    //    })
    //    .attr("width", nodeWidth)
    //    .attr("height", nodeHeight);
    //  //.attr("fill", "rgb(200,200,200)")
    //  //.attr("stroke", "rgb(30,30,30)");
    //
    //  node.append("text")
    //    .text(function (d) {
    //      var text = d[0].properties["name"];
    //      return getClampedText(text, 7);
    //    })
    //    .attr("x", function (d, i) {
    //      return nodeStart + (i * nodeWidth) + (i * edgeSize) + nodeWidth / 2;
    //    })
    //    .attr("y", function (d) {
    //      var posY = vSpacing + nodeHeight - 5;
    //      for (var i = 0; i < d[1]; i++) {
    //        posY += pathHeight + paths[i].sets.length * setHeight;
    //      }
    //
    //      return posY;
    //    });
    //
    //  var edgeGroup = p.append("g")
    //    .attr("class", "edgeGroup");
    //
    //  var edge = edgeGroup.selectAll("g.edge")
    //    .data(function (path, i) {
    //      return path.edges.map(function (edge) {
    //        return [edge, i];
    //      });
    //    })
    //    .enter()
    //    .append("g")
    //    .attr("class", "edge");
    //
    //  edge.append("line")
    //    .attr("x1", function (d, i) {
    //      if (isSourceNodeLeft(paths[d[1]].nodes, d[0], i)) {
    //        return ( nodeStart + (i + 1) * nodeWidth) + (i * edgeSize);
    //      } else {
    //        return ( nodeStart + (i + 1) * nodeWidth) + ((i + 1) * edgeSize);
    //      }
    //    })
    //    .attr("y1", function (d) {
    //      var posY = vSpacing + nodeHeight / 2;
    //      for (var i = 0; i < d[1]; i++) {
    //        posY += pathHeight + paths[i].sets.length * setHeight;
    //      }
    //
    //      return posY;
    //    })
    //    .attr("x2", function (d, i) {
    //      if (isSourceNodeLeft(paths[d[1]].nodes, d[0], i)) {
    //        return ( nodeStart + (i + 1) * nodeWidth) + ((i + 1) * edgeSize) - arrowWidth;
    //      } else {
    //        return ( nodeStart + (i + 1) * nodeWidth) + (i * edgeSize) + arrowWidth;
    //      }
    //    })
    //    .attr("y2", function (d) {
    //      var posY = vSpacing + nodeHeight / 2;
    //      for (var i = 0; i < d[1]; i++) {
    //        posY += pathHeight + paths[i].sets.length * setHeight;
    //      }
    //
    //      return posY;
    //    })
    //    .attr("marker-end", "url(#arrowRight)");
    //
    //  var setGroup = p.append("g")
    //    .attr("class", "setGroup");
    //
    //  var set = setGroup.selectAll("g.set")
    //    .data(function (path, i) {
    //      return path.sets.map(function (myset) {
    //        return [myset, i];
    //      });
    //    })
    //    .enter()
    //    .append("g")
    //    .attr("class", "set");
    //
    //  set.append("text")
    //    .text(function (d) {
    //      var text = d[0].id;
    //      return getClampedText(text, 15);
    //    })
    //    .attr("x", 0)
    //    .attr("y", function (d, i) {
    //      var posY = 2 * vSpacing + nodeHeight + i * setHeight;
    //      for (var i = 0; i < d[1]; i++) {
    //        posY += pathHeight + paths[i].sets.length * setHeight;
    //      }
    //
    //      return posY;
    //    });
    //
    //
    //  set.selectAll("line")
    //    .data(function (d, i) {
    //      //This is strange: i is seemingly the absolute set index, not relative to the parent...
    //      return d[0].relIndices.map(function (item) {
    //        var numPrevSets = 0;
    //        for (var pathIndex = 0; pathIndex < d[1]; pathIndex++) {
    //          numPrevSets += paths[pathIndex].sets.length;
    //        }
    //        return [item, i - numPrevSets, d[1]];
    //      });
    //    })
    //    .enter()
    //    .append("line")
    //    .attr("x1", function (d) {
    //      return nodeStart + (d[0] * nodeWidth) + (d[0] * edgeSize) + nodeWidth / 2;
    //
    //    })
    //    .attr("y1", function (d) {
    //      var posY = 2 * vSpacing + nodeHeight + d[1] * setHeight - 3;
    //      for (var i = 0; i < d[2]; i++) {
    //        posY += pathHeight + paths[i].sets.length * setHeight;
    //      }
    //
    //      return posY;
    //    })
    //    .attr("x2", function (d) {
    //      return nodeStart + ((d[0] + 1) * nodeWidth) + ((d[0] + 1) * edgeSize) + nodeWidth / 2;
    //    })
    //    .attr("y2", function (d) {
    //      var posY = 2 * vSpacing + nodeHeight + d[1] * setHeight - 3;
    //      for (var i = 0; i < d[2]; i++) {
    //        posY += pathHeight + paths[i].sets.length * setHeight;
    //      }
    //
    //      return posY;
    //    });
    //
    //  set.append("title")
    //    .text(function (d) {
    //      var text = d[0].id;
    //      return getClampedText(text);
    //    });
    //
    //  //path.sets.forEach(function (s) {
    //  //
    //  //});
    //
    //
    //  //.attr("text-anchor", "middle")
    //  //.attr("font-family", "sans-serif")
    //  //.attr("font-size", "11px")
    //  //.attr("fill", "rgb(30,30,30)");
    //}
    function getPathKey(d) {
      return d.id;
    }

    function renderPaths(svg, paths) {
      var pathHeight = 50;
      var nodeStart = 90;
      var nodeWidth = 50;
      var nodeHeight = 20;
      var vSpacing = 10;
      var edgeSize = 50;
      var arrowWidth = 7;
      var setHeight = 10;

      svg.selectAll("g.path")
        .remove();

      var p = svg.selectAll("g.path")
        .data(paths, getPathKey)
        .enter()
        .append("g");

      p.attr("class", "path")
        .on("click", function (d) {
          pathListeners.notify(d);
        })
        .attr("transform", function (d, i) {
          var posY = 0;
          for (var index = 0; index < i; index++) {
            posY += pathHeight + paths[index].sets.length * setHeight;
          }

          return "translate(0," + posY + ")";
        });

      var nodeGroup = p.append("g")
        .attr("class", "nodeGroup");

      var node = nodeGroup.selectAll("g.node")
        .data(function (path) {
          return path.nodes;
        })
        .enter()
        .append("g")
        .attr("class", "node");
      node.append("rect")
        .attr("x", function (d, i) {
          return nodeStart + (i * nodeWidth) + (i * edgeSize);
        })
        .attr("y", vSpacing)
        .attr("width", nodeWidth)
        .attr("height", nodeHeight);
      //.attr("fill", "rgb(200,200,200)")
      //.attr("stroke", "rgb(30,30,30)");

      node.append("text")
        .text(function (d) {
          var text = d.properties["name"];
          return getClampedText(text, 7);
        })
        .attr("x", function (d, i) {
          return nodeStart + (i * nodeWidth) + (i * edgeSize) + nodeWidth / 2;
        })
        .attr("y", vSpacing + nodeHeight - 5);

      var edgeGroup = p.append("g")
        .attr("class", "edgeGroup");

      var edge = edgeGroup.selectAll("g.edge")
        .data(function (path, i) {
          return path.edges.map(function (edge) {
            return [edge, i];
          });
        })
        .enter()
        .append("g")
        .attr("class", "edge");

      edge.append("line")
        .attr("x1", function (d, i) {
          if (isSourceNodeLeft(paths[d[1]].nodes, d[0], i)) {
            return ( nodeStart + (i + 1) * nodeWidth) + (i * edgeSize);
          } else {
            return ( nodeStart + (i + 1) * nodeWidth) + ((i + 1) * edgeSize);
          }
        })
        .attr("y1", vSpacing + nodeHeight / 2)
        .attr("x2", function (d, i) {
          if (isSourceNodeLeft(paths[d[1]].nodes, d[0], i)) {
            return ( nodeStart + (i + 1) * nodeWidth) + ((i + 1) * edgeSize) - arrowWidth;
          } else {
            return ( nodeStart + (i + 1) * nodeWidth) + (i * edgeSize) + arrowWidth;
          }
        })
        .attr("y2", vSpacing + nodeHeight / 2)
        .attr("marker-end", "url(#arrowRight)");

      var setGroup = p.append("g")
        .attr("class", "setGroup");

      var set = setGroup.selectAll("g.set")
        .data(function (path, i) {
          return path.sets.map(function (myset) {
            return [myset, i];
          });
        })
        .enter()
        .append("g")
        .attr("class", "set");

      set.append("text")
        .text(function (d) {
          var text = d[0].id;
          return getClampedText(text, 15);
        })
        .attr("x", 0)
        .attr("y", function (d, i) {
          return 2 * vSpacing + nodeHeight + i * setHeight;
        });


      set.selectAll("line")
        .data(function (d, i) {
          var numPrevSets = 0;
          for (var pathIndex = 0; pathIndex < d[1]; pathIndex++) {
            numPrevSets += paths[pathIndex].sets.length;
          }
          return d[0].relIndices.map(function (item) {
            return [item, i - numPrevSets];
          });
        })
        .enter()
        .append("line")
        .attr("x1", function (d) {
          return nodeStart + (d[0] * nodeWidth) + (d[0] * edgeSize) + nodeWidth / 2;
        })
        .attr("y1", function (d) {
          return 2 * vSpacing + nodeHeight + d[1] * setHeight - 3;
        })
        .attr("x2", function (d) {
          return nodeStart + ((d[0] + 1) * nodeWidth) + ((d[0] + 1) * edgeSize) + nodeWidth / 2;
        })
        .attr("y2", function (d) {
          return 2 * vSpacing + nodeHeight + d[1] * setHeight - 3;
        });

      set.append("title")
        .text(function (d) {
          var text = d[0].id;
          return getClampedText(text);
        });

      //path.sets.forEach(function (s) {
      //
      //});


      //.attr("text-anchor", "middle")
      //.attr("font-family", "sans-serif")
      //.attr("font-size", "11px")
      //.attr("fill", "rgb(30,30,30)");
    }

    function isSourceNodeLeft(nodes, edge, edgeIndex) {
      return nodes[edgeIndex].id === edge.sourceNodeId;
    }


  }
)
