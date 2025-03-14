import { MapData, UserMapData } from "../utils/types";

export class MemoryCache {
  private static memory = new Map<string, MapData | UserMapData | number>();

  static setMemory(key: string, value: MapData | UserMapData) {
    this.memory.set(key, value);
  }

  static setIp(key : string,value : number) {
    this.memory.set(key,value);
  }

  static getIp(key : string) : number {
    const data = this.memory.get(key);
    if(!data || typeof data != "number") return 0;
    return data;
  }

  static getMemory(key: string) {
    const item = this.memory.get(key);

    if (!item) return null;

    if(typeof item === "number") return item

    if (item.expiry && Date.now() > item.expiry) {
      this.memory.delete(key);
      return null;
    }

    if ("data" in item) {
      return item.data;
    }
    return item;
  }

  static clear() {
    this.memory.clear();
  }

  static delete(key: string) {
    this.memory.delete(key);
  }
}
