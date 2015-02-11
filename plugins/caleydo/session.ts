/**
 * Created by sam on 10.02.2015.
 */

var context : any = {};

export function store(key: string, value: any) {
  var bak = context[key];
  context[key] = value;
  return bak;
}

export function has(key: string) {
  return key in context;
}

export function retrieve<T>(key: string, default_ : T = null) : T {
  return has(key) ? context[key] : default_;
}
