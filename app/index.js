
var d3 = require('d3');
require('./main.css');

var svg = d3.select('#example').append('svg')
  .attr({
    width: 800,
    height: 500
  });

var ellipticArc = {
  x1: 200, y1: 150,
  rx: 25, ry: 100,
  x_axis_rotation: 30,
  large_arc_flag: 1,
  sweep_flag: 1,
  x2: 250, y2: 150
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

function toRadians(degree) {
  return degree * Math.PI / 180;
}

function toDegrees(radian) {
  return radian * 180 / Math.PI;
}

var phiDegree = ellipticArc.x_axis_rotation % 360;
console.log('phiDegree', phiDegree);
var phi = toRadians(phiDegree);
console.log('phi', phi);

var x1 = ellipticArc.x1;
var y1 = ellipticArc.y1;
var x2 = ellipticArc.x2;
var y2 = ellipticArc.y2;
var rx = Math.abs(ellipticArc.rx);
var ry = Math.abs(ellipticArc.ry);
console.log('rx', rx, 'ry', ry);
var largeArcFlag = ellipticArc.large_arc_flag;
var sweepFlag = ellipticArc.sweep_flag;

var cosPhi = Math.cos(phi);
var sinPhi = Math.sin(phi);
var halfDifX = (x1 - x2) / 2;
var halfDifY = (y1 - y2) / 2;
var x1p =  cosPhi * halfDifX + sinPhi * halfDifY;
var y1p = -sinPhi * halfDifX + cosPhi * halfDifY;
console.log('x1p', x1p, 'y1p', y1p);

var prx = rx * rx;
var pry = ry * ry;
var px1p = x1p * x1p;
var py1p = y1p * y1p;
// check that radii are large enough
var radiiCheck = px1p / prx + py1p / pry;
if (radiiCheck > 1) {
  rx *= Math.sqrt(radiiCheck);
  ry *= Math.sqrt(radiiCheck);
  console.log('modified rx', rx, 'ry', ry);
  prx = rx * rx;
  pry = ry * ry;
}

// compute: (cx1, cy1)

var sign = largeArcFlag === sweepFlag ? -1 : 1;
var denominator = prx * py1p + pry * px1p;
var numerator = prx * pry - denominator;
console.log('denominator', denominator, 'numerator', numerator);
var coef = numerator < 0 ? 0 : sign * Math.sqrt(numerator / denominator);
console.log('coef', coef);

var cxp = coef * (rx * y1p / ry);
var cyp = coef * (-ry * x1p / rx);
console.log('cxp=', cxp, 'cyp=', cyp);

var halfSumX = (x1 + x2) / 2;
var halfSumY = (y1 + y2) / 2;
var cx = cosPhi * cxp - sinPhi * cyp + halfSumX;
var cy = sinPhi * cxp + cosPhi * cyp + halfSumY;
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

var ux = (x1p - cxp) / rx;
var uy = (y1p - cyp) / ry;
var vx = (-x1p - cxp) / rx;
var vy = (-y1p - cyp) / ry;
console.log('ux', ux, 'uy', uy);
console.log('vx', vx, 'vy', vy);

var angleStartSign = uy < 0 ? -1 : 1;
var angleStartP = ux; // (1 * ux + 0 * uy);
var angleStartN = Math.sqrt(ux * ux + uy * uy);
var angleStart = toDegrees(angleStartSign * Math.acos(angleStartP / angleStartN)); //- phiDegree;

var angleExtentSign = ux * vy - uy * vx < 0 ? -1 : 1;
var angleExtentP = ux * vx + uy * vy;
var angleExtentN = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy));
var angleExtent = toDegrees(angleExtentSign * Math.acos(angleExtentP / angleExtentN));
console.log('before modify angleStart', angleStart, 'angleExtent', angleExtent);

if(!sweepFlag && angleExtent > 0) {
    angleExtent -= 360;
} else if (sweepFlag && angleExtent < 0) {
    angleExtent += 360;
}
angleExtent %= 360;
angleStart %= 360;
console.log('after modify angleStart', angleStart, 'angleExtent', angleExtent);

circleLayer.append('ellipse')
  .attr({
    'class': 'calculated',
    cx: cx,
    cy: cy,
    rx: rx,
    ry: ry,
    transform: 'translate(' + cx + ',' + cy + ')' + ' ' +
               'rotate(' + phiDegree + ')' + ' ' +
               'translate(' + (-cx) + ',' + (-cy) + ')'
  });

function getPoint(theta) {
  var rxc = rx * Math.cos(theta);
  var rys = ry * Math.sin(theta);
  return {
    x: cx + cosPhi * rxc - sinPhi * rys,
    y: cy + sinPhi * rxc + cosPhi * rys
  };
}

var n = 16;
var thetaStart = toRadians(angleStart);
var thetaExtent = toRadians(angleExtent);
var points = [];
points.push(getPoint(thetaStart))
for (var i = 1; i < n; i++) {
  var theta = thetaStart + i * thetaExtent / n;
  points.push(getPoint(theta));
}
points.push(getPoint(thetaStart + thetaExtent));
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
