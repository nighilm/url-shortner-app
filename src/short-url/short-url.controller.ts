import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ResponseDto } from "../common/dto/reponse.dto";
import { userSuccessMessages } from "../common/constants/success.constants";
import { customErrorMessages } from "../common/constants/error.constants";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { ShortURLService } from "./short-url.service";
import { CreateTopicDto } from "./dto/topic.dto";
import { CreateShortURLDto } from "./dto/short-url.dto";
import { CustomThrottlerGuard } from "src/auth/guards/throttle.guard";
import { AnalyticsService } from "../analytics/analytics.service";

@ApiBearerAuth()
@Controller('shorten')
@UseGuards(JwtAuthGuard)
export class ShortURLController {
    constructor(
        private shortURLService: ShortURLService,
        private analyticsService: AnalyticsService
    ) { }

    /**
     * Controller function to fetch all topic names 
     * @param req 
     * @returns topics
     */
    @Get('topic')
    async getTopics(): Promise<ResponseDto> {
        try {
            const topics: any[] = await this.shortURLService.getTopics()
            return {
                statusCode: 200,
                data: { topics },
                message: userSuccessMessages.USER_DETAILS_FETCH_SUCCESS
            }
        } catch (error) {
            throw new HttpException({
                statusCode: error?.status || HttpStatus.INTERNAL_SERVER_ERROR, data: {}, message: error?.message || customErrorMessages.INTERNAL_SERVER_ERROR
            }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**
    * Controller function to create new topic
    * @param req 
    * @returns topicId
    */
    @Post('topic')
    async createTopic(@Body() topicData: CreateTopicDto): Promise<ResponseDto> {
        try {
            const topicId: string = await this.shortURLService.createTopic(topicData)
            return {
                statusCode: 200,
                data: { topicId },
                message: userSuccessMessages.USER_DETAILS_FETCH_SUCCESS
            }
        } catch (error) {
            throw new HttpException({
                statusCode: error?.status || HttpStatus.INTERNAL_SERVER_ERROR, data: {}, message: error?.message || customErrorMessages.INTERNAL_SERVER_ERROR
            }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**
     * Controller function to create new short URL
     * @param req 
     * @param shortenURLData 
     * @returns short url and created date
     */
    @Post('')
    @UseGuards(CustomThrottlerGuard)
    async createShortURL(@Req() req: any, @Body() shortenURLData: CreateShortURLDto): Promise<ResponseDto> {
        try {
            const result: any = await this.shortURLService.createShortURL(req.user.id, req.headers.origin, shortenURLData)
            return {
                statusCode: 200,
                data: { result },
                message: userSuccessMessages.USER_DETAILS_FETCH_SUCCESS
            }
        } catch (error) {
            throw new HttpException({
                statusCode: error?.status || HttpStatus.INTERNAL_SERVER_ERROR, data: {}, message: error?.message || customErrorMessages.INTERNAL_SERVER_ERROR
            }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Get(':alias')
    async redirectShortURL(@Req() req: Request, @Param("alias") alias: string, @Res() res: any) {
        try {
            const { shortURLId, longURL } = await this.shortURLService.redirectShortURL(alias, req)
            await this.analyticsService.createAnalyticsLog(req, shortURLId)
            return res.redirect(longURL)
        } catch (error) {
            throw new HttpException({
                statusCode: error?.status || HttpStatus.INTERNAL_SERVER_ERROR, data: {}, message: error?.message || customErrorMessages.INTERNAL_SERVER_ERROR
            }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

}