import { LRUCache } from './CacheService';
import { DatabaseService } from './DatabaseService';
import { User } from '../types';

export const cacheService = new LRUCache<string, User>(100, 60);
export const dbService = new DatabaseService();
