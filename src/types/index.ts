export interface User {
    id: number;
    name: string;
    email: string;
}

export interface CacheStats {
    hits: number;
    misses: number;
    size: number;
    avgResponseTime?: number; // Added for bonus requirement
}
