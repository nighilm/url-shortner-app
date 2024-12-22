import { Controller, Get, HttpException, HttpStatus, Param, UseGuards } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { ResponseDto } from "src/common/dto/reponse.dto";
import { analyticsSuccessMessages } from "src/common/constants/success.constants";
import { customErrorMessages } from "src/common/constants/error.constants";
import { AnalysticsAliasResponse, AnalysticsTopicResponse } from "./interface/analytics.interface";

@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
    constructor(
        private analyticsService: AnalyticsService
    ) { }

    /**
     * Controller function to create analytics report for alias provided
     * @param alias
     * @returns AnalysticsAliasResponse
     */
    @Get(':alias')
    async getAliasAnalytics(@Param("alias") alias: string): Promise<ResponseDto> {
        try {
            const analyticsResult: AnalysticsAliasResponse = await this.analyticsService.getAliasAnalytics(alias)
            return {
                statusCode: 200,
                data: { analyticsResult },
                message: analyticsSuccessMessages.ANALYTICS_FETCH_SUCCESS_ALIAS
            }
        } catch (error) {
            throw new HttpException({
                statusCode: error?.status || HttpStatus.INTERNAL_SERVER_ERROR, data: {}, message: error?.message || customErrorMessages.INTERNAL_SERVER_ERROR
            }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**
     * Controller function to create analytics report for topic provided
     * @param topic
     * @returns AnalysticsTopicResponse
     */
    @Get('topic/:topic')
    async getTopicAnalytics(@Param("topic") topic: string): Promise<ResponseDto> {
        try {
            const analyticsResult: AnalysticsTopicResponse = await this.analyticsService.getTopicAnalytics(topic)
            return {
                statusCode: 200,
                data: { analyticsResult },
                message: analyticsSuccessMessages.ANALYTICS_FETCH_SUCCESS_TOPIC
            }
        } catch (error) {
            throw new HttpException({
                statusCode: error?.status || HttpStatus.INTERNAL_SERVER_ERROR, data: {}, message: error?.message || customErrorMessages.INTERNAL_SERVER_ERROR
            }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

}