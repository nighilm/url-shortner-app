import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { AnalyticsLog, AnalyticsLogSchema } from './entities/analyticsLog.schema';
import { Analytics, AnalyticsSchema } from './entities/analytics.schema';
import { ShortURL, ShortURLSchema } from '../short-url/entities/short-url.schema';
import { AnalyticsController } from './analytics.controller';
import { RedisModule } from '../redis/redis.module';
import { Topic, TopicSchema } from '../short-url/entities/topic.schema';

@Module({
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
    imports: [
        JwtModule, ConfigModule,
        RedisModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        MongooseModule.forFeature([
            { name: AnalyticsLog.name, schema: AnalyticsLogSchema },
            { name: Analytics.name, schema: AnalyticsSchema },
            { name: ShortURL.name, schema: ShortURLSchema },
            { name: Topic.name, schema: TopicSchema },
        ]),
    ],

    exports: [AnalyticsService]
})
export class AnalyticsModule { }
