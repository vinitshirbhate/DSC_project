import { MapData } from "../utils/types";

export class MemoryCache {
  private static memory = new Map<string, MapData>();

  static setMemory(key : string,value : MapData) {
    this.memory.set(key,value);
  }

  static getMemory(key : string) {
    const item = this.memory.get(key);

    if(!item) return null;

    if(item.expiry && Date.now() > item.expiry) {
        this.memory.delete(key);
        return null;
    }

    return item.data;
  }

  static clear(){
    this.memory.clear();
  }

  static delete(key : string) {
    this.memory.delete(key);
  }
}
