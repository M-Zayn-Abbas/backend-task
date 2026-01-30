import { User } from '../types';

const MOCK_USERS: Record<number, User> = {
    1: { id: 1, name: "John Doe", email: "john@example.com" },
    2: { id: 2, name: "Jane Smith", email: "jane@example.com" },
    3: { id: 3, name: "Alice Johnson", email: "alice@example.com" }
};

interface QueueTask {
    userId: number;
    resolve: (user: User | null) => void;
    reject: (err: any) => void;
}

export class DatabaseService {
    private queue: QueueTask[] = [];
    private processing: boolean = false;
    private activeRequests: Map<number, Promise<User | null>> = new Map();

    // Simulate DB fetch with delay
    private async fetchFromDb(id: number): Promise<User | null> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = MOCK_USERS[id] || null;
                resolve(user);
            }, 200);
        });
    }

    // Request Coalescing Wrapper
    public async getUserById(id: number): Promise<User | null> {
        // If request already in flight for this ID, return the existing promise
        if (this.activeRequests.has(id)) {
            console.log(`[Database] Coalescing request for User ${id}`);
            return this.activeRequests.get(id)!;
        }

        // Create a new promise that wraps the queue mechanism
        const promise = this.enqueueRequest(id).finally(() => {
            this.activeRequests.delete(id);
        });

        this.activeRequests.set(id, promise);
        return promise;
    }

    // Add to Async Processing Queue
    private enqueueRequest(userId: number): Promise<User | null> {
        return new Promise((resolve, reject) => {
            this.queue.push({ userId, resolve, reject });
            this.processQueue();
        });
    }

    // Process Queue (one by one or batch, here we do concurrent implementation as requested "handle multiple simultaneous requests without blocking")
    // The requirement says: "Use a queue... to manage requests... Ensure that the API can handle multiple simultaneous requests without blocking."
    // This implies the queue shouldn't be SERIAL processing 1 by 1 if we want high concurrency, OR it means the queue offloads the main thread (node is single threaded anyway so async is key).
    // "simulate the database call. Use a queue_name... to manage requests"
    // I will implement a worker-like pattern where we process items from the queue.
    private async processQueue() {
        if (this.processing) return;
        this.processing = true;

        while (this.queue.length > 0) {
            const task = this.queue.shift();
            if (task) {
                // Fire and forget the individual task processing so we don't block the loop?
                // OR await it to simulate a limited connection pool? 
                // "Ensure that the API can handle multiple simultaneous requests without blocking."
                // I'll just run the fetch.
                this.fetchFromDb(task.userId)
                    .then(task.resolve)
                    .catch(task.reject);
            }
        }

        this.processing = false;
    }
}
