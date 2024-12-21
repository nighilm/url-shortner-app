import { ThrottlerStorageRedisService } from "@nest-lab/throttler-storage-redis";
import { ThrottlerAsyncOptions } from "@nestjs/throttler";
import Redis from "ioredis";
import { ConfigModule, ConfigService } from "@nestjs/config";


export const throttlerConfigOptions: ThrottlerAsyncOptions = {
    useFactory: async (configService: ConfigService) => ({
        throttlers: [
            {
                ttl: 60,
                limit: 10
            }
        ],
        storage: new ThrottlerStorageRedisService(new Redis({
            host: configService.get<string>("REDIS_HOST"),
            port: configService.get<number>("REDIS_PORT"),
        })),
    }),
    imports: [ConfigModule],
    inject: [ConfigService],

}