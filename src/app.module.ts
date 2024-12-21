import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { ShortURLModule } from './short-url/short-url.module';
import { mongooseConnectOptions } from './configuration/mongoDb.config';
import { envFileConfigOptions } from './configuration/environment.config';
import { RedisModule } from './redis/redis.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { throttlerConfigOptions } from './configuration/throttler.config';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ShortURLModule,
    ConfigModule.forRoot(envFileConfigOptions),
    MongooseModule.forRootAsync(mongooseConnectOptions),
    RedisModule,
    ThrottlerModule.forRootAsync(throttlerConfigOptions),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
