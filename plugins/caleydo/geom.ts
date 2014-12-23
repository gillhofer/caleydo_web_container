/**
 * Created by Samuel Gratzl on 08.10.2014.
 */

import C = require('./main');

import _2D = require('./2D');


export var CORNER : any = <any>[];
CORNER['N']  = CORNER[0] = 'n';
CORNER['NE'] = CORNER[1] = 'ne';
CORNER['E']  = CORNER[2] = 'e';
CORNER['SE'] = CORNER[3] = 'se';
CORNER['S']  = CORNER[4] = 's';
CORNER['SW'] = CORNER[5] = 'sw';
CORNER['W']  = CORNER[6] = 'w';
CORNER['NW'] = CORNER[7] = 'nw';

/**
 * a simple basic shape
 */
export class AShape implements _2D.IShape {
  /**
   * shift the shape by the given amount
   * @param x
   * @param y
   */
  shift(x:number, y:number) : AShape;
  shift(xy:_2D.Vector2D) : AShape;
  shift(xy: number[]) : AShape;
  shift() {
    if (typeof arguments[0] === 'number') {
      this.shiftImpl(arguments[0], arguments[1]);
    } else if (Array.isArray(arguments[0])) {
      this.shiftImpl(arguments[0][0], arguments[0][1]);
    } else {
      this.shiftImpl(arguments[0].x, arguments[0].y);
    }
    return this;
  }

  /**
   * center of this shape
   * @returns {Circle}
   */
  get center(): _2D.Vector2D {
    return this.bs().xy;
  }

  /**
   * axis aligned bounding box (ro)
   */
  aabb() : Rect {
    throw new Error('not implemented');
  }

  /**
   * a specific corner of th axis aligned bounding box
   * @param corner
   * @returns {_2D.Vector2D}
   */
  corner(corner: string) : _2D.Vector2D {
    var r = this.aabb();
    switch(corner) {
      case CORNER.N:
        return vec2(r.cx,r.y);
      case CORNER.S:
        return vec2(r.cx,r.y2);
      case CORNER.W:
        return vec2(r.x,r.cy);
      case CORNER.E:
        return vec2(r.x2,r.cy);
      case CORNER.NE:
        return vec2(r.x2,r.y);
      case CORNER.NW:
        return r.xy;
      case CORNER.SE:
        return vec2(r.x2,r.y2);
      case CORNER.SW:
        return vec2(r.x,r.y2);
    }
    return this.center;
  }

  /**
   * bounding sphere (ro)
   */
  bs(): Circle {
    throw new Error('not implemented');
  }

  shiftImpl(x: number, y: number) {

  }

  asIntersectionParams() : _2D.IIntersectionParam {
    throw new Error('Not Implemented');
  }

  intersects(other: AShape) {
    return _2D.Intersection.intersectShapes(this, other);
  }
}

/**
 * a simple bounding rect
 */
export class Rect extends AShape {
  constructor(public x = 0, public y = 0, public w = 0, public h = 0) {
    super();
  }

  toString() {
    return 'Rect(x=' + this.x + ',y=' + this.y + ',w=' + this.w + ',h=' + this.h + ')';
  }

  get xy() {
    return new _2D.Vector2D(this.x, this.y);
  }

  get x2y2() {
    return new _2D.Vector2D(this.x2, this.y2);
  }

  get cx() {
    return this.x + this.w / 2;
  }

  get cy() {
    return this.y + this.h / 2;
  }

  set cx(val: number) {
    this.x = val - this.w / 2;
  }

  set cy(val: number) {
    this.y = val - this.y / 2;
  }

  get x2() {
    return this.x + this.w;
  }

  get y2() {
    return this.y + this.h;
  }

  set x2(val: number) {
    this.w = val - this.x;
  }

  set y2(val: number) {
    this.h = val - this.y;
  }

  shiftImpl(x, y) {
    this.x += x;
    this.y += y;
  }

  aabb() : Rect {
    return this;
  }

  bs() : Circle {
    return circle(this.cx, this.cy, Math.sqrt(this.w*2+this.h*2));
  }

  transform(scale: number[], rotate: number) {
    //TODO rotate
    return rect(this.x * scale[0], this.y * scale[1], this.w * scale[0], this.h * scale[1]);
  }

  asIntersectionParams() : _2D.IIntersectionParam {
    return {
      name: 'Rectangle',
      params : [this.xy, this.x2y2]
    };
  }

}

export class Circle extends AShape {
  constructor(public x = 0, public y = 0, public radius = 0) {
    super();
  }

  get xy() {
    return new _2D.Vector2D(this.x, this.y);
  }

  toString() {
    return 'Circle(x=' + this.x + ',y=' + this.y + ',radius=' + this.radius + ')';
  }

  shiftImpl(x, y) {
    this.x += x;
    this.y += y;
  }

  aabb() : Rect {
    return rect(this.x-this.radius,this.y-this.radius, this.radius*2, this.radius*2);
  }

  bs() : Circle {
    return this;
  }

  transform(scale: number[], rotate: number) {
    //TODO rotate
    return circle(this.x * scale[0], this.y * scale[1], this.radius * (scale[0] + scale[1])/2);
  }

  asIntersectionParams() : _2D.IIntersectionParam {
    return {
      name: 'Circle',
      params : [this.xy, this.radius]
    };
  }
}

/*Ellipse.prototype.getIntersectionParams() {
  return new IntersectionParams("Ellipse", [this.center.point, parseFloat(this.svgNode.getAttributeNS(null, "rx")), parseFloat(this.svgNode.getAttributeNS(null, "ry"))]);
};
return new IntersectionParams("Line", [this.p1.point, this.p2.point]);
*/

export class Polygon extends AShape {
  constructor(private points : _2D.Vector2D[] = []) {
    super();
  }

  push(x: number, y: number);
  push(...points: _2D.Vector2D[]);
  push() {
    if (arguments.length == 2 && typeof arguments[0] === 'number') {
      this.points.push(vec2(arguments[0], arguments[1]));
    } else {
      this.points.push.apply(this.points, <_2D.Vector2D[]>C.argList(arguments));
    }
  }

  toString() {
    return 'Polygon(' + this.points.join(',')+')';
  }

  shiftImpl(x, y) {
    this.points.forEach((p) => {
      p.x += x;
      p.y += y;
    });
  }

  get length() {
    return this.points.length;
  }

  aabb() : Rect {
    var min_x = Number.POSITIVE_INFINITY, min_y = Number.POSITIVE_INFINITY, max_x = Number.NEGATIVE_INFINITY, max_y = Number.NEGATIVE_INFINITY;
    this.points.forEach((p) => {
      if (p.x < min_x) {
        min_x = p.x;
      }
      if (p.y < min_y) {
        min_y = p.y;
      }
      if (p.x > max_x) {
        max_x = p.x;
      }
      if (p.y > max_y) {
        max_y = p.y;
      }
    });
    return rect(min_x, min_y, max_x - min_x, max_y - min_y);
  }

  bs() : Circle {
    var mean_x = 0, mean_y = 0;
    this.points.forEach((p) => {
      mean_x += p.x;
      mean_y += p.y;
    });
    mean_x /= this.length;
    mean_y /= this.length;
    //TODO better polygon center
    var radius = 0;
    this.points.forEach((p) => {
      var dx = p.x - mean_x;
      var dy = p.y - mean_y;
      var d = dx*dx + dy*dy;
      if (d > radius) {
        radius = d;
      }
    });
    return circle(mean_x, mean_y, Math.sqrt(radius));
  }

  transform(scale: number[], rotate: number) {
    //TODO rotate
    return polygon(this.points.map((p) => vec2(p.x * scale[0], p.y * scale[1])));
  }

  pointInPolygon(point: _2D.Vector2D) {
    var length = this.points.length;
    var counter = 0;
    var x_inter;
    var p1 = this.points[0];
    for (var i = 1; i <= length; i++) {
      var p2 = this.points[i % length];
      if (point.y > Math.min(p1.y, p2.y)) {
        if (point.y <= Math.max(p1.y, p2.y)) {
          if (point.x <= Math.max(p1.x, p2.x)) {
            if (p1.y != p2.y) {
              x_inter = (point.y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x;
              if (p1.x == p2.x || point.x <= x_inter) {
                counter++;
              }
            }
          }
        }
      }
      p1 = p2;
    }
    return (counter % 2 == 1);
  }

  get area() {
    var area = 0;
    var length = this.points.length;
    for (var i = 0; i < length; i++) {
      var h1 = this.points[i];
      var h2 = this.points[(i + 1) % length];
      area += (h1.x * h2.y - h2.x * h1.y);
    }
    return area / 2;
  }
  get centroid() {
    var length = this.points.length;
    var area6x = 6 * this.area;
    var x_sum = 0;
    var y_sum = 0;
    for (var i = 0; i < length; i++) {
      var p1 = this.points[i];
      var p2 = this.points[(i + 1) % length];
      var cross = (p1.x * p2.y - p2.x * p1.y);
      x_sum += (p1.x + p2.x) * cross;
      y_sum += (p1.y + p2.y) * cross;
    }
    return vec2(x_sum / area6x, y_sum / area6x);
  }
  get isClockwise() {
    return this.area < 0;
  }
  get isCounterClockwise() {
    return this.area > 0;
  }

  get isConcave() {
    var positive = 0;
    var negative = 0;
    var length = this.points.length;
    for (var i = 0; i < length; i++) {
      var p0 = this.points[i];
      var p1 = this.points[(i + 1) % length];
      var p2 = this.points[(i + 2) % length];
      var v0 = _2D.Vector2D.fromPoints(p0, p1);
      var v1 = _2D.Vector2D.fromPoints(p1, p2);
      var cross = v0.cross(v1);
      if (cross < 0) {
        negative++;
      } else {
        positive++;
      }
    }
    return (negative != 0 && positive != 0);
  }

  get isConvex() {
    return !this.isConvex;
  }
}

export function vec2(x : number, y : number) : _2D.Vector2D {
  return new _2D.Vector2D(x,y);
}

export function rect(x:number, y:number, w:number, h:number) {
  return new Rect(x, y, w, h);
}
export function circle(x:number, y:number, radius:number) {
  return new Circle(x, y, radius);
}
export function polygon(...points : _2D.Vector2D[]);
export function polygon(points : _2D.Vector2D[]);
export function polygon() {
  if (C.isArray(arguments[0])) {
    return new Polygon(arguments[0]);
  }
  return new Polygon(C.argList(arguments));
}


export function wrap(obj: any): AShape {
  if(!obj) {
    return obj;
  }
  if (obj instanceof AShape) {
    return <AShape>obj;
  }
  if (obj.hasOwnProperty('x') && obj.hasOwnProperty('y')) {
    if (obj.hasOwnProperty('radius') || obj.hasOwnProperty('r')) {
      return circle(obj.x, obj.y, obj.hasOwnProperty('radius') ? obj.radius : obj.r);
    }
    if (obj.hasOwnProperty('w') && obj.hasOwnProperty('h')) {
      return rect(obj.x, obj.y, obj.w, obj.h);
    }
    if (obj.hasOwnProperty('width') && obj.hasOwnProperty('height')) {
      return rect(obj.x, obj.y, obj.width, obj.height);
    }
  }
  if (C.isArray(obj) && obj.length > 0 && obj[0].hasOwnProperty('x') && obj[0].hasOwnProperty('y')) {
    return polygon(obj);
  }
  return obj; //can't derive it, yet
}
