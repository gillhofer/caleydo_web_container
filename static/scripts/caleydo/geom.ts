/**
 * Created by Samuel Gratzl on 08.10.2014.
 */

import C = require('./main');

export interface IVec2 {
  x: number;
  y: number;
}

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
export class AShape {
  /**
   * shift the shape by the given amount
   * @param x
   * @param y
   */
  shift(x:number, y:number) : AShape;
  shift(xy:IVec2) : AShape;
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
  get center() {
    return this.bs();
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
   * @returns {IVec2}
   */
  corner(corner: string) : IVec2 {
    var r = this.aabb();
    switch(corner) {
      case CORNER.N:
        return { x : r.cx, y : r.y};
      case CORNER.S:
        return { x : r.cx, y : r.y2};
      case CORNER.W:
        return { x : r.x, y : r.cy};
      case CORNER.E:
        return { x : r.x2, y : r.cy};
      case CORNER.NE:
        return { x : r.x2, y : r.y};
      case CORNER.NW:
        return r;
      case CORNER.SE:
        return { x : r.x2, y : r.y2};
      case CORNER.SW:
        return { x : r.x, y : r.y2};
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
}

export class Circle extends AShape {
  constructor(public x = 0, public y = 0, public radius = 0) {
    super();
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
}

export class Polygon extends AShape {
  constructor(private points : IVec2[] = []) {
    super();
  }

  push(x: number, y: number);
  push(...points: IVec2[]);
  push() {
    if (arguments.length == 2 && typeof arguments[0] === 'number') {
      this.points.push({ x: arguments[0], y : arguments[1]});
    } else {
      this.points.push.apply(this.points, <IVec2[]>C.argList(arguments));
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
}

export function rect(x:number, y:number, w:number, h:number) {
  return new Rect(x, y, w, h);
}
export function circle(x:number, y:number, radius:number) {
  return new Circle(x, y, radius);
}
export function polygon(...points : IVec2[]);
export function polygon(points : IVec2[]);
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