import { Controller, Get, HttpException, HttpStatus, Param, UseGuards } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { ResponseDto } from "src/common/dto/reponse.dto";
import { analyticsSuccessMessages } from "src/common/constants/success.constants";
import { customErrorMessages } from "src/common/constants/error.constants";
import { AnalysticsResponse } from "./interface/analytics.interface";

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
     * @returns AnalysticsResponse
     */
    @Get(':alias')
    async getAliasAnalytics(@Param("alias") alias: string): Promise<ResponseDto> {
        try {
            const analyticsResult: AnalysticsResponse = await this.analyticsService.getAliasAnalytics(alias)
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

}