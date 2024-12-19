import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponseDto } from '../common/dto/reponse.dto';
import { customErrorMessages } from 'src/common/constants/error.constants';
import { GoogleAuthGuard } from './guards/google.guard';
import { authSuccessMessages } from 'src/common/constants/success.constants';

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
      const { accessToken, refreshToken } = await this.authService.userLogin(req.user)
      return {
        statusCode: 200,
        data: { accessToken, refreshToken },
        message: authSuccessMessages.LOGIN_SUCCESS
      }
    } catch (error) {
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR, data: {}, message: customErrorMessages.INTERNAL_SERVER_ERROR
      }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}