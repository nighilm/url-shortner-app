import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
    Inject,
    Injectable,
    Logger,
} from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }
    private logger = new Logger(RedisService.name);

    async set(key: string, value: unknown, ttl?: number): Promise<void> {
        await this.cacheManager.set(key, value, ttl);
    }

    async get(key: string): Promise<any> {
        const jsonData: string | undefined = await this.cacheManager.get<string>(key);
        return jsonData ? JSON.parse(jsonData!) : undefined;
    }
}