import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../auth/entities/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    controllers: [UserController],
    providers: [UserService],
    imports: [
        JwtModule, ConfigModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
        ]),
    ],

    exports: [JwtModule, PassportModule]
})
export class UserModule { }
