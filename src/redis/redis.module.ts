import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisService } from './redis.service';
import { RedisOptions } from 'src/configuration/redis.config';

@Module({
    imports: [CacheModule.registerAsync(RedisOptions)],
    controllers: [],
    providers: [RedisService],
    exports: [RedisService],
})
export class RedisModule { }