import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { AnalyticsLog, AnalyticsLogSchema } from './entities/analyticsLog.schema';
import { Analytics, AnalyticsSchema } from './entities/analytics.schema';

@Module({
    controllers: [],
    providers: [AnalyticsService],
    imports: [
        JwtModule, ConfigModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        MongooseModule.forFeature([
            { name: AnalyticsLog.name, schema: AnalyticsLogSchema },
            { name: Analytics.name, schema: AnalyticsSchema },
        ]),
    ],

    exports: [AnalyticsService]
})
export class AnalyticsModule { }
