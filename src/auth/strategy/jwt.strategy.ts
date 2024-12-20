import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { isValidObjectId } from "mongoose";
import { Strategy, ExtractJwt } from 'passport-jwt'
import { customErrorMessages } from "../../common/constants/error.constants";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        })
    }

    async validate(payload: any) {
        if (!isValidObjectId(payload.id)) {
            throw new UnauthorizedException(customErrorMessages.UNAUTHORIZED_USER)
        }
        return { id: payload.id }
    }

}