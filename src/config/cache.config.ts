import { registerAs } from '@nestjs/config';
import { CacheModuleOptions } from '@nestjs/cache-manager';

export default registerAs('cache', (): CacheModuleOptions => {
  const cacheEnabled = process.env.CACHE_ENABLED === 'true';

  // Usando apenas cache em memória, independente da configuração
  return {
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10) || 3600,
    max: 100,
  };
});