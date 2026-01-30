import { Request, Response } from 'express';
import { cacheService } from '../services';

export class CacheController {
    static getStatus(req: Request, res: Response) {
        const stats = cacheService.getStats();
        return res.json(stats);
    }

    static clearCache(req: Request, res: Response) {
        cacheService.clear();
        return res.json({ message: 'Cache cleared successfully' });
    }
}
