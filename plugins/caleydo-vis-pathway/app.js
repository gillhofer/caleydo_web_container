/**
 * Created by Christian on 11.12.2014.
 */
require(['jquery', 'd3', '../caleydo/main', '../caleydo/data', '../caleydo/plugin', '../caleydo-window/main', '../caleydo/d3util'], function ($, d3, C, data, plugins, window, utils) {
  'use strict';

  $(document).ready(function () {

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

    //$.ajax({
    //
    //  // The 'type' property sets the HTTP method.
    //  // A value of 'PUT' or 'DELETE' will trigger a preflight request.
    //  type: 'POST',
    //  //type: 'GET',
    //
    //  // The URL to make the request to.
    //  url: 'http://localhost:7474/db/data/ext/KShortestPaths/graphdb/kShortestPaths',
    //  //url: 'http://localhost:7474/db/data/ext/FindShortestPath/graphdb/get_shortest_path',
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
    //
    //  data: '{"source":"http://localhost/:7474/db/data/node/15991", ' +
    //  '"target":"http://localhost/:7474/db/data/node/1713", ' +
    //  '"k":"3", ' +
    //  '"costFunction":"function getCost(properties) {return 1.0}", ' +
    //  '"ignoreDirection":"false"}',
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
    //    d3.select("body").append("p").text(response);
    //    //d3.select("body").append("img").attr("src", "http://rest.kegg.jp/get/hsa00052/image");
    //    var paths = JSON.parse(response)
    //
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

    var propertyCosts = {
      size: {
        big: 2.0,
        small: 1.0
      },
      mood: {
        good: 2.0,
        bad: 1.0
      }
    };

    var myCost = getCost([["size", "big"], ["mood", "bad"]]);
    d3.select("body").append("p").text(myCost);

    function getCost(properties) {
      var totalCost = 1.0;
      properties.forEach(function (propObject) {
        var property = propObject[0];
        var value = propObject[1];
        var propDef = propertyCosts[property];
        if (typeof propDef != "undefined") {
          var cost = propDef[value];
          if (typeof cost != "undefined") {
            totalCost += cost;
          }
        }
      });
      return totalCost;
    }


    $.get("/api/pathway/path", function (resp) {
      $('<h1>'+resp+'</h1>').appendTo('body');
    });

  });


})
