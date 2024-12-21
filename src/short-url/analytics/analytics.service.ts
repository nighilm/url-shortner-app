import { Injectable } from "@nestjs/common";
import { AnalyticsLog } from "./entities/analyticsLog.schema";
import { parseDataFromRequest } from "src/common/helpers/uaParser.helper";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Analytics } from "./entities/analytics.schema";


@Injectable()
export class AnalyticsService {
    constructor(
        @InjectModel(AnalyticsLog.name) private analyticsLogModel: Model<AnalyticsLog>,
        @InjectModel(Analytics.name) private analyticsModel: Model<Analytics>
    ) { }

    async createAnalyticsLog(request: any, shortURLId: string | Types.ObjectId): Promise<any> {
        shortURLId = new Types.ObjectId(shortURLId)
        const userId: Types.ObjectId = new Types.ObjectId(request?.user?.id as string)
        const userAgent: string = request.headers["user-agent"]
        const ipAddress: string = request.ip.split(':')[3]
        const { deviceType, osType } = parseDataFromRequest(userAgent)
        await this.analyticsLogModel.create({
            shortURLId, userId, ipAddress, userAgent, deviceType, osType
        })

        let analyticsRecord: Analytics = await this.analyticsModel.findOne({ shortURLId })
        if (!analyticsRecord) {
            analyticsRecord = await this.analyticsModel.create({
                shortURLId,
                uniqueClicks: 1,
                totalClicks: 1,
                uniqueUsers: [userId]
            })
        } else {
            analyticsRecord.totalClicks++
            const userAlreadyClicked = analyticsRecord.uniqueUsers.some((user) => userId.equals(user._id))
            if (!userAlreadyClicked) {
                analyticsRecord.uniqueUsers.push(userId)
                analyticsRecord.uniqueClicks++
                analyticsRecord.markModified('uniqueUsers')
            }
            analyticsRecord.save()
        }
    }
}