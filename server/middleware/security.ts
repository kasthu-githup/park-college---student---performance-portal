import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

// In-memory rate limiter per IP
interface RateLimitBucket {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitBucket>();

export function rateLimiter(limit = 600, windowMs = 15 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const bucket = rateLimitMap.get(ip);
    if (!bucket || now > bucket.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    bucket.count += 1;
    if (bucket.count > limit) {
      res.setHeader('Retry-After', Math.ceil((bucket.resetTime - now) / 1000));
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
      });
    }

    next();
  };
}

// Security Headers Middleware
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}

// Centralized Safe Error Handling Middleware
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // Log full error internally for DevOps inspection
  console.error('[SERVER_ERROR]', {
    message: err.message,
    stack: config.isProduction ? undefined : err.stack,
    timestamp: new Date().toISOString(),
  });

  const statusCode = err.statusCode || err.status || 500;
  
  // Never leak internal SQL, connection passwords, or stack traces
  const safeMessage = config.isProduction && statusCode === 500
    ? 'An internal server error occurred. Please contact system administrator.'
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: safeMessage,
    code: err.code || 'INTERNAL_ERROR',
  });
}

// Request audit logger
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api/')) {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
}
