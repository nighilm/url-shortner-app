import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.schema';
import { generateJwtToken } from 'src/common/helpers/jwt.helper';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private readonly configService: ConfigService,

    ) { }
    private logger = new Logger(AuthService.name)

    async userLogin(userDetails: any) {
        let user: User = await this.userModel.findOne({ googleId: userDetails.googleId })
        if (!user) {
            user = await this.userModel.create(userDetails)
        }
        const accessToken: string = generateJwtToken({ id: user.id }, this.configService.get<string>('ACCESS_TOKEN_VALIDITY_DURATION'))
        const refreshToken: string = generateJwtToken({ id: user.id }, this.configService.get<string>('REFRESH_TOKEN_VALIDITY_DURATION'))
        return { accessToken, refreshToken }
    }
}
