/**
 * Created by Christian on 11.12.2014.
 */
require(['jquery', 'd3', '../caleydo/main', '../caleydo/data', '../caleydo/plugin', '../caleydo-window/main', '../caleydo/d3util'], function ($, d3, C, data, plugins, window, utils) {
    'use strict';

    //var jsonPaths = require('./testpaths.json');

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

    $(document).ready(function () {

      var w = 800;
      var h = 800;

      var svg = d3.select("body").append("svg")
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

      var svg2 = d3.select("body").append("svg")
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
      //  //  $.ajax({
      //  //
      //  //    // The 'type' property sets the HTTP method.
      //  //    // A value of 'PUT' or 'DELETE' will trigger a preflight request.
      //  //    //type: 'POST',
      //  //    type: 'GET',
      //  //
      //  //    // The URL to make the request to.
      //  //    url: 'http://localhost:7474/db/data/',
      //  //    //url: 'http://localhost:7474/db/data/ext/FindShortestPath/graphdb/get_shortest_path',
      //  //
      //  //    accepts: 'application/json',
      //  //
      //  //    success: function (response) {
      //  //      d3.select("body").append("p").text(response);
      //  //    },
      //  //
      //  //    error: function (response) {
      //  //      var x = 2
      //  //    }
      //  //  });
      //
      //  console.time("time")
      //
      //  $.ajax({
      //
      //    // The 'type' property sets the HTTP method.
      //    // A value of 'PUT' or 'DELETE' will trigger a preflight request.
      //    //type: 'POST',
      //    type: 'GET',
      //
      //    // The URL to make the request to.
      //    //url: 'http://localhost:7474/db/data/ext/KShortestPaths/graphdb/kShortestPaths',
      //    url: '/api/pathway/path',
      //
      //    accepts: 'application/json',
      //
      //    // The 'contentType' property sets the 'Content-Type' header.
      //    // The JQuery default for this property is
      //    // 'application/x-www-form-urlencoded; charset=UTF-8', which does not trigger
      //    // a preflight. If you set this value to anything other than
      //    // application/x-www-form-urlencoded, multipart/form-data, or text/plain,
      //    // you will trigger a preflight request.
      //    contentType: 'application/json',
      //
      //    //data: '{"source":"http://localhost/:7474/db/data/node/15991", ' +
      //    //'"target":"http://localhost/:7474/db/data/node/1713", ' +
      //    //'"k":"3", ' +
      //    //'"costFunction":"function getCost(properties) {return 1.0}", ' +
      //    //'"ignoreDirection":"false"}',
      //    //data: '{"node_from": "/node/116", "node_to": "/node/92", "relationship_types": ["PATHWAY_EDGE"], "relationship_costs": [1.0], "only_one_route": true, "soft_timeout": 5000, "max_cost": 1000000.0 }',
      //
      //    //xhrFields: {
      //    // The 'xhrFields' property sets additional fields on the XMLHttpRequest.
      //    // This can be used to set the 'withCredentials' property.
      //    // Set the value to 'true' if you'd like to pass cookies to the server.
      //    // If this is enabled, your server must respond with the header
      //    // 'Access-Control-Allow-Credentials: true'.
      //    //withCredentials: false
      //    //},
      //
      //    //headers: {
      //    // Set any custom headers here.
      //    // If you set any non-simple headers, your server must include these
      //    // headers in the 'Access-Control-Allow-Headers' response header.
      //    //},
      //
      //    success: function (response) {
      //
      //      console.timeEnd("time")
      //      var paths = JSON.parse(response);
      //
      //      var strp = paths.toString();
      //
      //      if (paths.length > 0) {
      //
      //        renderPaths(svg, paths);
      //
      //        var firstPath = paths[0];
      //        var firstNode = firstPath.nodes[0];
      //        var lastNode = firstPath.nodes[firstPath.nodes.length - 1];
      //
      //        var pathGraph = getGraphFromPaths(paths);
      //
      //        renderGraph(svg2, pathGraph, firstNode, lastNode);
      //      }
      //    },
      //
      //    error: function (response) {
      //      // Here's where you handle an error response.
      //      // Note that if the error was due to a CORS issue,
      //      // this function will still fire, but there won't be any additional
      //      // information about the error.
      //      var x = 2
      //    }
      //  });

      $.getJSON("testpaths.json", function (paths) {
        loadPaths(paths);
      });

      function loadPaths(paths) {

        if (paths.length > 0) {

          renderPaths(svg, paths);

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

    });

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


      var force = d3.layout.force()
        .nodes(graph.nodes)
        .links(graph.edges)
        .size([w, h])
        //.linkDistance(300)
        .charge(graph.nodes.length * -200)
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


      force.on("tick", function () {
        nodeRects.attr("x", function (d) {
          //if (d.id == startNode.id) {
          //  return 20;
          //} else if (d.id == endNode.id) {
          //  return w - 20;
          //} else {
          return d.x - nodeWidth / 2;
          //}
        });
        nodeRects.attr("y", function (d) {
          //if (d.id == startNode.id || d.id == endNode.id) {
          //  return h / 2 - nodeHeight / 2;
          //} else {
          return d.y - nodeHeight / 2;
          //}

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
      });

      pathListeners.add(function (path) {

        var nodeStep = (w - 2 * (sideSpacing + nodeWidth / 2)) / (path.nodes.length - 1);
        var posX = sideSpacing + nodeWidth / 2;
        var posY = h / 2;
        graph.nodes.forEach(function (node) {
          node.fixed = false;
        });

        path.nodes.forEach(function (fixedNode) {
          graph.nodes.forEach(function (node) {
            if (node.id == fixedNode.id) {
              node.x = posX;
              node.px = posX;
              node.y = posY;
              node.py = posY;
              node.fixed = true;
              posX += nodeStep;
            }
          });
        });
        nodeGroup.selectAll("g.node")
          .attr("class", function (d) {
            return "node " + (d.fixed ? ("fixed") : "");
          });
        force.nodes(graph.nodes).resume();

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


    function renderPaths(svg, paths) {

      var posX = 20;
      var posY = 20;

      paths.forEach(function (path) {
        var p = svg.append("g");
        p.attr("class", "path")
          .on("click", function () {
            pathListeners.notify(path);
          });
        renderPath(p, path, posX, posY);
        posY += 50;
      });
    }

    function renderPath(p, path, posX, posY) {
      var nodeWidth = 50;
      var nodeHeight = 20;
      var vSpacing = 10;
      var edgeSize = 50;
      var arrowWidth = 7;

      var nodeGroup = p.append("g")
        .attr("class", "nodeGroup");

      var node = nodeGroup.selectAll("g.node")
        .data(path.nodes)
        .enter()
        .append("g")
        .attr("class", "node");
      node.append("rect")
        .attr("x", function (d, i) {
          return (i * nodeWidth) + (i * edgeSize);
        })
        .attr("y", posY + vSpacing)
        .attr("width", nodeWidth)
        .attr("height", nodeHeight);
      //.attr("fill", "rgb(200,200,200)")
      //.attr("stroke", "rgb(30,30,30)");

      node.append("text")
        .text(function (d) {
          var text = d.properties["name"];
          if (text.length > 7) {
            text = text.substring(0, 7);
          }
          return text;
        })
        .attr("x", function (d, i) {
          return (i * nodeWidth) + (i * edgeSize) + nodeWidth / 2;
        })
        .attr("y", posY + vSpacing + nodeHeight - 5);

      var edgeGroup = p.append("g")
        .attr("class", "edgeGroup");

      var edge = edgeGroup.selectAll("g.edge")
        .data(path.edges)
        .enter()
        .append("g")
        .attr("class", "edge");

      edge.append("line")
        .attr("x1", function (d, i) {
          if (isSourceNodeLeft(path.nodes, d, i)) {
            return ((i + 1) * nodeWidth) + (i * edgeSize);
          } else {
            return ((i + 1) * nodeWidth) + ((i + 1) * edgeSize);
          }
        })
        .attr("y1", posY + vSpacing + nodeHeight / 2)
        .attr("x2", function (d, i) {
          if (isSourceNodeLeft(path.nodes, d, i)) {
            return ((i + 1) * nodeWidth) + ((i + 1) * edgeSize) - arrowWidth;
          } else {
            return ((i + 1) * nodeWidth) + (i * edgeSize) + arrowWidth;
          }
        })
        .attr("y2", posY + vSpacing + nodeHeight / 2)
        .attr("marker-end", "url(#arrowRight)");
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
