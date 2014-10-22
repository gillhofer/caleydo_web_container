/**
 * Created by Samuel Gratzl on 22.10.2014.
 */


export interface IPersistable {
  /**
   * persist the current configuration and return
   */
  persist(): any;
  /**
   * restores from stored persisted state
   * @param persisted a result of a previous persist call
   */
  restore(persisted: any) : void;
}