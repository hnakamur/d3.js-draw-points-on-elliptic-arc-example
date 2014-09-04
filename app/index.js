
var d3 = require('d3');
require('./main.css');
var EllipticArc = require('../lib/elliptic-arc');

var svg = d3.select('#example').append('svg')
  .attr({
    width: 800,
    height: 500
  });

var ellipticArcData = {
  x1: 200, y1: 150,
  rx: 25, ry: 100,
  xAxisRotation: 30,
  largeArcFlag: 1,
  sweepFlag: 1,
  x2: 250, y2: 150
};

var referenceLayer = svg.append('g').attr('class', 'reference-layer');
var circleLayer = svg.append('g').attr('class', 'circle-layer');

referenceLayer.selectAll('path.reference').data([ellipticArcData])
  .enter().append('path')
  .attr({
    'class': 'reference',
    d: function(d) {
      return 'M' + d.x1 + ' ' + d.y1 +
        'A' + d.rx + ' ' + d.ry +
        ' ' + d.xAxisRotation +
        ' ' + d.largeArcFlag + ' ' + d.sweepFlag +
        ' ' + d.x2 + ' ' + d.y2;
    }
  });

var ellipticArc = EllipticArc.fromSvgPathParameters(
  ellipticArcData.x1,
  ellipticArcData.y1,
  ellipticArcData.rx,
  ellipticArcData.ry,
  ellipticArcData.xAxisRotation,
  ellipticArcData.largeArcFlag,
  ellipticArcData.sweepFlag,
  ellipticArcData.x2,
  ellipticArcData.y2
);

circleLayer.selectAll('circle.center').data([ellipticArc])
  .enter().append('circle')
  .attr({
    'class': 'center',
    cx: function(d) { return d.cx; },
    cy: function(d) { return d.cy; },
    r: 2
  });

circleLayer.selectAll('ellipse.calculated').data([ellipticArc])
  .enter().append('ellipse')
  .attr({
    'class': 'calculated',
    cx: function(d) { return d.cx },
    cy: function(d) { return d.cy },
    rx: function(d) { return d.rx },
    ry: function(d) { return d.ry },
    transform: function(d) {
      var cx = d.cx;
      var cy = d.cy;
      var xAxisRotation = d.xAxisRotation;
      return 'translate(' + cx + ',' + cy + ')' + ' ' +
             'rotate(' + xAxisRotation + ')' + ' ' +
             'translate(' + (-cx) + ',' + (-cy) + ')';
    }
  });

var n = 16;
var points = [];
for (var i = 0; i <= n; i++) {
  var t = i / n;
  points.push(ellipticArc.getPointAt(t));
}
circleLayer.selectAll('circle.calculated').data(points)
  .enter().append('circle')
  .attr({
    'class': function(d, i) {
      if (i === 0) {
        return 'calculated start';
      } else if (i === points.length - 1) {
        return 'calculated end';
      } else {
        return 'calculated between';
      }
    },
    cx: function(d) { return d.x; },
    cy: function(d) { return d.y; },
    r: 1
  });
