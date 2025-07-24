import {Request, Response, NextFunction} from "express";

import {requestMeta} from "../infrastucture/db";
import {jwtService} from "../compositon-root";

export const requestLoggerMiddleware =  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = req.ip || req.connection.remoteAddress || '';
    const url = req.originalUrl; // или req.baseUrl по желанию
    const now = new Date();
    const tenSecondsAgo = new Date(now.getTime() - 10000);
    try {
        // Логируем запрос
        await jwtService.recordRequestMeta({ ip: ip, url: url, date: now });

        // Подсчёт количества запросов с этого IP на этот URL за последние 10 сек
        const count = await requestMeta.countDocuments({
            ip: ip,
            url: url,
            date: { $gte: tenSecondsAgo }
        });


        // Ограничение
        const MAX_REQUESTS_PER_10_SECONDS = 5;
        if (count > MAX_REQUESTS_PER_10_SECONDS) {
            console.warn(`[RateLimit] IP: ${ip} превысил лимит запросов к ${url}`);
            res.status(429).json({ message: 'Too many requests' });
            return;
        }

        next();
    } catch (error) {
        console.error('Ошибка при логировании запроса:', error);
        next(error);
    }
};




