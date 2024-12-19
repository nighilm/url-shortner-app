import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
const jwtService: JwtService = new JwtService()
const configService: any = new ConfigService()

/**
 * Function to generate new JWT token with provided payload and token expiry time
 * @param payload 
 * @param tokenExpiry 
 * @returns generated JWT token
*/
export const generateJwtToken = (payload: any, tokenExpiry: string): string => {
    try {
        const generatedToken: string = jwtService.sign(payload, {
            secret: configService.get('JWT_SECRET'),
            expiresIn: tokenExpiry
        })
        return generatedToken
    } catch (error) {
        throw error
    }
}