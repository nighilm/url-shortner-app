import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
const jwtService: JwtService = new JwtService()

/**
 * Function to generate new JWT token with provided payload and token expiry time
 * @param payload 
 * @param tokenExpiry 
 * @returns generated JWT token
*/
export const generateJwtToken = (payload: any, tokenExpiry: string, secret: string): string => {
    try {
        const generatedToken: string = jwtService.sign(payload, {
            secret: secret,
            expiresIn: tokenExpiry
        })
        return generatedToken
    } catch (error) {
        throw error
    }
}