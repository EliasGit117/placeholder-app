import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
  // Strips auth/session headers and credential fields app-wide, including
  // the oRPC request logger.
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["set-cookie"]',
      'res.headers["set-cookie"]',
      'password',
      'accessToken',
      'clientSecret',
      'signatureKey',
      'token',
      '*.password',
      '*.accessToken',
      '*.clientSecret',
      '*.signatureKey',
      '*.token'
    ],
    censor: '[REDACTED]'
  }
});
