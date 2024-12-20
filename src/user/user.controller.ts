import { Body, Controller, Get, HttpException, HttpStatus, Put, Req, UseGuards } from "@nestjs/common";
import { ResponseDto } from "../common/dto/reponse.dto";
import { UserService } from "./user.service";
import { userSuccessMessages } from "../common/constants/success.constants";
import { customErrorMessages } from "../common/constants/error.constants";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { UserProfileUpdateDto } from "./dto/user.dto";

@ApiBearerAuth()
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(
        private userService: UserService
    ) { }

    /**
     * Controller function to fetch user profile data 
     * @param req 
     * @returns user data
     */
    @Get('profile')
    async getUserProfile(@Req() req: any): Promise<ResponseDto> {
        try {
            const user = await this.userService.getUserProfile(req.user.id)
            return {
                statusCode: 200,
                data: { user },
                message: userSuccessMessages.USER_DETAILS_FETCH_SUCCESS
            }
        } catch (error) {
            throw new HttpException({
                statusCode: error?.status || HttpStatus.INTERNAL_SERVER_ERROR, data: {}, message: error?.message || customErrorMessages.INTERNAL_SERVER_ERROR
            }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**
     * COntroller function to update user profile details
     * @param req 
     * @param userDetails 
     * @returns 
     */
    @Put('profile')
    async updateUserProfile(@Req() req: any, @Body() userDetails: UserProfileUpdateDto): Promise<ResponseDto> {
        try {
            await this.userService.updateUserProfile(req.user.id, userDetails)
            return {
                statusCode: 200,
                data: {},
                message: userSuccessMessages.USER_DETAILS_UPDATE_SUCCESS
            }
        } catch (error) {
            throw new HttpException({
                statusCode: error?.status || HttpStatus.INTERNAL_SERVER_ERROR, data: {}, message: error?.message || customErrorMessages.INTERNAL_SERVER_ERROR
            }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}