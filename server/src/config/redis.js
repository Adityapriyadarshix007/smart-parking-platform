// Redis configuration (optional for production)
// For development, this is a placeholder

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
};

const isRedisAvailable = () => {
  return process.env.USE_REDIS === 'true';
};

module.exports = { redisConfig, isRedisAvailable };
