// import typescript declarations for libraries
/// <reference path="typings/tsd.d.ts" />
/// < reference path="tsd.gen.d.ts" /> disable not needed because of modules

declare module 'require' {
  function r(deps: string[], f: any);
  export = r;
}

declare module 'caleydo-plugins-gen' {
  export var plugins : any[];
}