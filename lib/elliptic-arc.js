function EllipticArc(cx, cy, rx, ry, xAxisRotation, angleStart, angleExtent) {
  this.cx = cx;
  this.cy = cy;
  this.rx = rx;
  this.ry = ry;
  this.xAxisRotation = xAxisRotation;
  this.angleStart = angleStart;
  this.angleExtent = angleExtent;
}

EllipticArc.fromSvgPathParameters = function(x1, y1, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x2, y2) {
  var phi = toRadians(xAxisRotation % 360);
  var cosPhi = Math.cos(phi);
  var sinPhi = Math.sin(phi);
  var halfDifX = (x1 - x2) / 2;
  var halfDifY = (y1 - y2) / 2;
  var x1p =  cosPhi * halfDifX + sinPhi * halfDifY;
  var y1p = -sinPhi * halfDifX + cosPhi * halfDifY;
  var prx, pry, px1p, py1p, radiiCheck, sign, denominator, numerator,
      coef, cxp, cyp, halfSumX, halfSumY, cx, cy, ux, uy, vx, vy,
      angleStart, angleExtent;

  rx = Math.abs(rx);
  ry = Math.abs(ry);
  prx = rx * rx;
  pry = ry * ry;
  px1p = x1p * x1p;
  py1p = y1p * y1p;

  // check that radii are large enough
  radiiCheck = px1p / prx + py1p / pry;
  if (radiiCheck > 1) {
    rx *= Math.sqrt(radiiCheck);
    ry *= Math.sqrt(radiiCheck);
    prx = rx * rx;
    pry = ry * ry;
  }

  // compute: (cx1, cy1)
  var sign = largeArcFlag === sweepFlag ? -1 : 1;
  var denominator = prx * py1p + pry * px1p;
  var numerator = prx * pry - denominator;
  var coef = numerator < 0 ? 0 : sign * Math.sqrt(numerator / denominator);

  var cxp = coef * (rx * y1p / ry);
  var cyp = coef * (-ry * x1p / rx);

  var halfSumX = (x1 + x2) / 2;
  var halfSumY = (y1 + y2) / 2;
  var cx = cosPhi * cxp - sinPhi * cyp + halfSumX;
  var cy = sinPhi * cxp + cosPhi * cyp + halfSumY;

  var ux = (x1p - cxp) / rx;
  var uy = (y1p - cyp) / ry;
  var vx = (-x1p - cxp) / rx;
  var vy = (-y1p - cyp) / ry;

  sign = uy < 0 ? -1 : 1;
  numerator = ux; // (1 * ux + 0 * uy);
  denominator = Math.sqrt(ux * ux + uy * uy);
  var angleStart = toDegrees(sign * Math.acos(numerator / denominator));

  sign = ux * vy - uy * vx < 0 ? -1 : 1;
  numerator = ux * vx + uy * vy;
  denominator = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy));
  var angleExtent = toDegrees(sign * Math.acos(numerator / denominator));

  if (!sweepFlag && angleExtent > 0) {
    angleExtent -= 360;
  } else if (sweepFlag && angleExtent < 0) {
    angleExtent += 360;
  }
  angleExtent %= 360;
  angleStart %= 360;

  return new EllipticArc(cx, cy, rx, ry, xAxisRotation, angleStart, angleExtent);
};

function toRadians(degree) {
  return degree * Math.PI / 180;
}

function toDegrees(radian) {
  return radian * 180 / Math.PI;
}

EllipticArc.prototype.getPointAt = function(t) {
  var theta = toRadians(this.angleStart + t * this.angleExtent);
  var cx = this.cx;
  var cy = this.cy;
  var rx = this.rx;
  var ry = this.ry;
  var phi = toRadians(this.xAxisRotation % 360);
  var cosPhi = Math.cos(phi);
  var sinPhi = Math.sin(phi);
  var rxc = rx * Math.cos(theta);
  var rys = ry * Math.sin(theta);
  return {
    x: cx + cosPhi * rxc - sinPhi * rys,
    y: cy + sinPhi * rxc + cosPhi * rys
  };
}

module.exports = EllipticArc;
