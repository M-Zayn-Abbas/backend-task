import { Request, Response } from 'express';
import { cacheService, dbService } from '../services';

export class UserController {
    static async getUser(req: Request, res: Response) {
        const id = parseInt(req.params.id as string);

        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        // 1. Check Cache
        const cacheKey = `user:${id}`; // Namespace keys
        const cachedUser = cacheService.get(cacheKey);

        if (cachedUser) {
            console.log(`[API] Cache Hit for User ${id}`);
            return res.json(cachedUser);
        }

        console.log(`[API] Cache Miss for User ${id}`);

        try {
            // 2. Fetch from DB (handled by Coalescer/Queue internally)
            const user = await dbService.getUserById(id);

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // 3. Update Cache
            cacheService.set(cacheKey, user);

            return res.json(user);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    static async createUser(req: Request, res: Response) {
        // Simulating user creation ( Bonus )
        // In a real app, this would validate body and insert into DB.
        // For this mock, we can just echo back or add to the in-memory mock if we exported it mutable.
        // But since `MOCK_USERS` is inside `DatabaseService` and private/const, we can't easily add without a method.
        // I'll skip modifying the actual mock for simplicity unless I update DatabaseService, but I'll return a success response and cache it to simulate "created and cached".

        // Actually, let's just return the body as valid user
        const { id, name, email } = req.body;
        if (!id || !name || !email) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        // Simulate caching the new user
        const newUser = { id, name, email };
        cacheService.set(`user:${id}`, newUser);

        return res.status(201).json({ message: 'User created (simulated)', user: newUser });
    }
}
