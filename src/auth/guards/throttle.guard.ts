
import { Injectable } from '@nestjs/common';
import { ThrottlerException, ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';
import { RedisCacheNames } from '../../common/enum/cacheTypes.enum';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
    getTracker(req: Record<string, any>) {
        return req.user?.id || req.ip;
    }

    protected async handleRequest({ context, ttl, limit, blockDuration, throttler }: ThrottlerRequest): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const tracker = this.getTracker(request);
        const key = this.generateKey(context, tracker, RedisCacheNames.RateLimit);
        const { totalHits, timeToExpire } = await this.storageService.increment(key, ttl * 1000, limit, blockDuration, RedisCacheNames.RateLimit);
        if (totalHits > limit) {
            throw new ThrottlerException("Too Many Requests")
        }
        return true
    }
}
