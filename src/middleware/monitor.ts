import { Request, Response, NextFunction } from 'express';

export const requestMonitor = (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();

    res.on('finish', () => {
        const diff = process.hrtime(start);
        const durationInMs = (diff[0] * 1e9 + diff[1]) / 1e6;
        console.log(`[Monitor] ${req.method} ${req.url} - ${res.statusCode} - ${durationInMs.toFixed(3)}ms`);
        // Ideally we would push this to a metrics service
    });

    next();
};
