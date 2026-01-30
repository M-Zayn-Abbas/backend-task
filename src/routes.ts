import { Router } from 'express';
import { UserController } from './controllers/UserController';
import { CacheController } from './controllers/CacheController';

const router = Router();

// User Routes
router.get('/users/:id', UserController.getUser as any); // Type casting for Express async handler compatibility if needed
router.post('/users', UserController.createUser as any);

// Cache Routes
router.get('/cache-status', CacheController.getStatus as any);
router.delete('/cache', CacheController.clearCache as any);

export default router;
