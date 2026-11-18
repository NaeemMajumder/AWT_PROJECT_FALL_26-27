import { Injectable } from "@nestjs/common";

@Injectable()
export class InMemoryCacheService {
  private cache: Map<string, unknown>;

  constructor() {
    this.cache = new Map<string, unknown>();
  }

  get(key: string): unknown {
    return this.cache.get(key);
  }

  set(key: string, value: unknown): void {
    this.cache.set(key, value);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  executeOnce(key: string, callback: () => void | Promise<void>): void {
    if (this.cache.has(key)) return;
    callback();
    this.cache.set(key, 1);
  }
}
