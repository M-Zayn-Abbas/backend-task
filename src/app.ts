import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import routes from './routes';
import { rateLimiter } from './middleware/rateLimiter';
import { requestMonitor } from './middleware/monitor';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(requestMonitor); // Monitor first to catch all
app.use(rateLimiter); // Then Rate Limit

// Routes
app.use('/api', routes); // logical prefix

// 404
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

export default app;
