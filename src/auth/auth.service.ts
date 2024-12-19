import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.schema';
import { generateJwtToken } from 'src/common/helpers/jwt.helper';
import { ConfigService } from '@nestjs/config';
import { userErrorMessages } from 'src/common/constants/error.constants';

@Injectable()
export class AuthService {

    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private readonly configService: ConfigService,

    ) { }
    private logger = new Logger(AuthService.name)

    /**
     * Function to signin user and create one if not exits
     * @param userDetails 
     * @returns accessToken, refreshToken
     */
    async userLogin(userDetails: any) {
        let user: User = await this.userModel.findOne({ googleId: userDetails.googleId })
        if (!user) {
            user = await this.userModel.create(userDetails)
        }
        const accessToken: string = generateJwtToken({ id: user.id }, this.configService.get<string>('ACCESS_TOKEN_VALIDITY_DURATION'), this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'))
        const refreshToken: string = generateJwtToken({ id: user.id }, this.configService.get<string>('REFRESH_TOKEN_VALIDITY_DURATION'), this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'))
        user.refreshToken = refreshToken
        user.save()
        return { accessToken, refreshToken }
    }

    /**
     * Function to create new token from refresh token
     * @param refreshTokenProvided 
     * @returns { accessToken, refreshToken }

     */
    async createTokens(refreshTokenProvided: string) {
        const user: User = await this.userModel.findOne({ refreshToken: refreshTokenProvided })
        if (!user) {
            throw new NotFoundException(userErrorMessages.USER_NOT_FOUND)
        }
        const accessToken: string = generateJwtToken({ id: user.id }, this.configService.get<string>('ACCESS_TOKEN_VALIDITY_DURATION'), this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'))
        const refreshToken: string = generateJwtToken({ id: user.id }, this.configService.get<string>('REFRESH_TOKEN_VALIDITY_DURATION'), this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'))
        user.refreshToken = refreshToken
        user.save()
        return { accessToken, refreshToken }
    }
}
