import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponseDto } from '../common/dto/reponse.dto';
import { customErrorMessages } from 'src/common/constants/error.constants';
import { GoogleAuthGuard } from './guards/google.guard';
import { authSuccessMessages } from 'src/common/constants/success.constants';
import { RefreshTokenDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  /**
   * Google auth signin controller function 
   */
  @Get('signin')
  @UseGuards(GoogleAuthGuard)
  async signin() { }

  /**
   * Google auth callback controller function
   * @param req 
   * @returns accessToken refreshToken
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async callback(@Req() req: any): Promise<ResponseDto> {
    try {
      const tokens = await this.authService.userLogin(req.user)
      return {
        statusCode: 200,
        data: tokens,
        message: authSuccessMessages.LOGIN_SUCCESS
      }
    } catch (error) {
      throw new HttpException({
        statusCode: error?.status || HttpStatus.INTERNAL_SERVER_ERROR, data: {}, message: error?.message || customErrorMessages.INTERNAL_SERVER_ERROR
      }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Create new tokens from refresh token provided 
   * @param body 
   * @returns accessToken refreshToken
   */
  @Post('refresh-token')
  async createNewAccessToken(@Body() body: RefreshTokenDto): Promise<ResponseDto> {
    try {
      const tokens = await this.authService.createTokens(body.refreshToken)
      return {
        statusCode: 200,
        data: tokens,
        message: authSuccessMessages.LOGIN_SUCCESS
      }
    } catch (error) {
      throw new HttpException({
        statusCode: error?.status || HttpStatus.INTERNAL_SERVER_ERROR, data: {}, message: error?.message || customErrorMessages.INTERNAL_SERVER_ERROR
      }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}