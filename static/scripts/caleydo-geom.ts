/**
 * Created by Samuel Gratzl on 08.10.2014.
 */

export interface IVec2 {
  x: number;
  y: number;
}

export class AShape {
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
   * bounding sphere (ro)
   */
  bs(): Circle {
    throw new Error('not implemented');
  }

  shiftImpl(x: number, y: number) {

  }
}

export class Rect extends AShape {
  constructor(public x = 0, public y = 0, public w = 0, public h = 0) {
    super();
  }

  toString() {
    return 'Rect(x=' + this.x + ',y=' + this.y + ',w=' + this.w + ',h=' + this.h + ')';
  }

  shiftImpl(x, y) {
    this.x += x;
    this.y += y;
  }

  aabb() : Rect {
    return this;
  }

  bs() : Circle {
    return circle(this.x+ this.w/2, this.y + this.h/2,Math.sqrt(this.w*2+this.h*2));
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

export function rect(x:number, y:number, w:number, h:number) {
  return new Rect(x, y, w, h);
}
export function circle(x:number, y:number, radius:number) {
  return new Circle(x, y, radius);
}

export function wrap(obj: any): AShape {
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
  return obj; //can't derive it, yet
}