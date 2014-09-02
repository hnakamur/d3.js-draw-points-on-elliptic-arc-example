function EllipticArc(x1, y1, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x2, y2) {
  this.x1 = x1;
  this.y1 = y1;
  this.rx = rx;
  this.ry = ry;
  this.xAxisRotation = xAxisRotation;
  this.largeArcFlag = largeArcFlag;
  this.sweepFlag = sweepFlag;
  this.x2 = x2;
  this.y2 = y2;

  this.calculateCenterAndAngles();
}

function toRadians(degree) {
  return degree * Math.PI / 180;
}

function toDegrees(radian) {
  return radian * 180 / Math.PI;
}

EllipticArc.prototype.calculateCenterAndAngles = function() {
  var phiDegrees = this.xAxisRotation % 360;
  var phi = toRadians(phiDegrees);
  var x1 = this.x1;
  var y1 = this.y1;
  var x2 = this.x2;
  var y2 = this.y2;
  var rx = Math.abs(this.rx);
  var ry = Math.abs(this.ry);
  var largeArcFlag = this.largeArcFlag;
  var sweepFlag = this.sweepFlag;

  var cosPhi = Math.cos(phi);
  var sinPhi = Math.sin(phi);
  var halfDifX = (x1 - x2) / 2;
  var halfDifY = (y1 - y2) / 2;
  var x1p =  cosPhi * halfDifX + sinPhi * halfDifY;
  var y1p = -sinPhi * halfDifX + cosPhi * halfDifY;

  var prx = rx * rx;
  var pry = ry * ry;
  var px1p = x1p * x1p;
  var py1p = y1p * y1p;

  // check that radii are large enough
  var radiiCheck = px1p / prx + py1p / pry;
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

  var angleStartSign = uy < 0 ? -1 : 1;
  var angleStartP = ux; // (1 * ux + 0 * uy);
  var angleStartN = Math.sqrt(ux * ux + uy * uy);
  var angleStart = toDegrees(angleStartSign * Math.acos(angleStartP / angleStartN));

  var angleExtentSign = ux * vy - uy * vx < 0 ? -1 : 1;
  var angleExtentP = ux * vx + uy * vy;
  var angleExtentN = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy));
  var angleExtent = toDegrees(angleExtentSign * Math.acos(angleExtentP / angleExtentN));

  if (!sweepFlag && angleExtent > 0) {
    angleExtent -= 360;
  } else if (sweepFlag && angleExtent < 0) {
    angleExtent += 360;
  }
  angleExtent %= 360;
  angleStart %= 360;

  this.cx = cx;
  this.cy = cy;
  this.angleStart = angleStart;
  this.angleExtent = angleExtent;
  this.cosPhi = cosPhi;
  this.sinPhi = sinPhi;
}

EllipticArc.prototype.getPointAt = function(t) {
  var theta = toRadians(this.angleStart + t * this.angleExtent);
  var cx = this.cx;
  var cy = this.cy;
  var rx = this.rx;
  var ry = this.ry;
  var cosPhi = this.cosPhi;
  var sinPhi = this.sinPhi;
  var rxc = rx * Math.cos(theta);
  var rys = ry * Math.sin(theta);
  return {
    x: cx + cosPhi * rxc - sinPhi * rys,
    y: cy + sinPhi * rxc + cosPhi * rys
  };
}

module.exports = EllipticArc;
