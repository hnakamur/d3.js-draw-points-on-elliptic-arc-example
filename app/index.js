
var d3 = require('d3');
require('./main.css');

var svg = d3.select('#example').append('svg')
  .attr({
    width: 800,
    height: 500
  });

var ellipticArc = {
  x1: 100, y1: 150,
  rx: 25, ry: 100,
  x_axis_rotation: -30,
  large_arc_flag: 0,
  sweep_flag: 1,
  x2: 150, y2: 125 
};

var referenceLayer = svg.append('g').attr('class', 'reference-layer');
var circleLayer = svg.append('g').attr('class', 'circle-layer');

circleLayer.selectAll('path.reference').data([ellipticArc])
  .enter().append('path')
  .attr({
    'class': 'reference',
    d: function(d) {
      return 'M' + d.x1 + ' ' + d.y1 +
        'A' + d.rx + ' ' + d.ry +
        ' ' + d.x_axis_rotation +
        ' ' + d.large_arc_flag + ' ' + d.sweep_flag +
        ' ' + d.x2 + ' ' + d.y2;
    }
  });

function toRadian(degree) {
  return degree * Math.PI / 180;
}

function toDegree(radian) {
  return radian * 180 / Math.PI;
}

var phi = toRadian(ellipticArc.x_axis_rotation);
console.log('phi', phi);
var x1 = ellipticArc.x1;
var y1 = ellipticArc.y1;
var x2 = ellipticArc.x2;
var y2 = ellipticArc.y2;
var rx = ellipticArc.rx;
var ry = ellipticArc.ry;
console.log('rx', rx, 'ry', ry);

var cosPhi = Math.cos(phi);
var sinPhi = Math.sin(phi);
var x1x2Half = (x1 - x2) / 2;
var y1y2Half = (y1 - y2) / 2;
var x1p =  cosPhi * x1x2Half + sinPhi * y1y2Half;
var y1p = -sinPhi * x1x2Half + cosPhi * y1y2Half;
console.log('x1p', x1p, 'y1p', y1p);

var rx2y1p2PlusRy2x1p2 = rx*rx*y1p*y1p + ry*ry*x1p*x1p;
console.log('rx2y1p2PlusRy2x1p2', rx2y1p2PlusRy2x1p2, 'numerator', (rx*rx*ry*ry - rx2y1p2PlusRy2x1p2));
var cpCoeffAbs = Math.sqrt(Math.abs(rx*rx*ry*ry - rx2y1p2PlusRy2x1p2) / rx2y1p2PlusRy2x1p2);
var cpCoeffSign = ellipticArc.large_arc_flag !== ellipticArc.sweep_flag ? 1 : -1;
console.log('cpCoeffAbs', cpCoeffAbs, 'cpCoeffSign', cpCoeffSign);

var cxp = cpCoeffSign * cpCoeffAbs * (rx * y1p / ry);
var cyp = cpCoeffSign * cpCoeffAbs * (-ry * x1p / rx);
console.log('cxp=', cxp, 'cyp=', cyp);

var cx = cosPhi * cxp - sinPhi * cyp + (x1 + x2) / 2;
var cy = sinPhi * cxp + cosPhi * cyp + (y1 + y2) / 2;
console.log('cx=', cx, 'cy=', cy);

var center = {cx: cx, cy: cy, r: 2};
circleLayer.selectAll('circle.center').data([center])
  .enter().append('circle')
  .attr({
    'class': 'center',
    cx: function(d) { return d.cx; },
    cy: function(d) { return d.cy; },
    r: function(d) { return d.r; }
  });

function dotProduct(u, v) {
  return u.x * v.x + u.y * v.y;
}

function magnitude(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

function angleBetweenTwoVectors(u, v) {
  return Math.acos(dotProduct(u, v) / (magnitude(u) * magnitude(v)));
}

var theta1 = angleBetweenTwoVectors(
  {x: 1, y: 0},
  {x: (x1p - cxp) / rx, y: (y1p - cyp) / ry}
);
console.log('theta1', theta1, toDegree(theta1));

var deltaTheta = angleBetweenTwoVectors(
  {x: (x1p - cxp) / rx, y: (y1p - cyp) / ry},
  {x: (-x1p - cxp) / rx, y: (-y1p - cyp) / ry}
);
if (ellipticArc.sweep_flag === 0 && deltaTheta > 0) {
  deltaTheta -= 2 * Math.PI;
} else if (ellipticArc.sweep_flag === 1 && deltaTheta < 0) {
  deltaTheta += 2 * Math.PI;
}
console.log('deltaTheta', deltaTheta, toDegree(deltaTheta));

circleLayer.append('path')
  .attr({
    'class': 'calculated',
    d: 'M' + ellipticArc.rx + ' ' + 0 +
       'A' + ellipticArc.rx + ' ' + ellipticArc.ry +
       ' ' + 0 + ' ' + 1 + ' ' + 0 +
       ' ' + (-ellipticArc.rx) + ' ' + 0,
    transform: 'translate(' + cx + ',' + cy + ')' + ' ' +
               'rotate(' + ellipticArc.x_axis_rotation + ')'
  });

var lineTheta1 = 0*toRadian(ellipticArc.x_axis_rotation) + theta1;
circleLayer.append('path')
  .attr({
    'class': 'calculated',
    d: 'm' + cx + ' ' + cy +
       ' ' + 40 * Math.cos(lineTheta1) + ' ' + 40 * Math.sin(lineTheta1)
  });

var lineTheta2 = 0*toRadian(ellipticArc.x_axis_rotation) + theta1 + deltaTheta;
circleLayer.append('path')
  .attr({
    'class': 'calculated',
    d: 'm' + cx + ' ' + cy +
       ' ' + 100 * Math.cos(lineTheta2) + ' ' + 100 * Math.sin(lineTheta2)
  });
