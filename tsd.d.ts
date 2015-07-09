// import typescript declarations for libraries
/// <reference path="typings/tsd.d.ts" />

declare module 'require' {
  function r(deps: string[], f: any);
  export = r;
}

declare module 'module' {
  export function config(): any;
}