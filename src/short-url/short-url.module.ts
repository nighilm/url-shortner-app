import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../auth/entities/user.schema';
import { Topic, TopicSchema } from './entities/topic.schema';
import { ShortURLController } from './short-url.controller';
import { ShortURLService } from './short-url.service';
import { ShortURL, ShortURLSchema } from './entities/short-url.schema';
import { RedisService } from '../redis/redis.service';

@Module({
    controllers: [ShortURLController],
    providers: [ShortURLService, RedisService],
    imports: [
        JwtModule, ConfigModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Topic.name, schema: TopicSchema },
            { name: ShortURL.name, schema: ShortURLSchema },
        ]),
    ],

    exports: [JwtModule, PassportModule]
})
export class ShortURLModule { }
