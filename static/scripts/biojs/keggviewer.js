/**
 * Created by Samuel Gratzl on 08.09.2014.
 */
var instance = new Biojs.KEGGViewer({
  target: 'YourOwnDivId',
  pathId: 'hsa04910',
  proxyUrl: '../biojs/dependencies/proxy/proxy.php',
  expression:{
    upColor:'red',
    downColor:'blue',
    genes: ['hsa:7248', 'hsa:51763', 'hsa:2002', 'hsa:2194'],
    conditions: [
      {
        name: 'condition 1',
        values: [-1, 0.5, 0.7, -0.3]
      },
      {
        name: 'condition 2',
        values: [0.5, -0.1, -0.2, 1]
      },
      {
        name: 'condition 3',
        values: [0, 0.4, -0.2, 0.5]
      }
    ]
  }

});