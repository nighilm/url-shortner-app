import { Injectable, NotFoundException } from "@nestjs/common";
import { AnalyticsLog } from "./entities/analyticsLog.schema";
import { parseDataFromRequest } from "../common/helpers/uaParser.helper";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Analytics } from "./entities/analytics.schema";
import { ShortURL } from "../short-url/entities/short-url.schema";
import { analyticsErrorMessages } from "../common/constants/error.constants";
import { AnalysticsResponse } from "./interface/analytics.interface";
import { generateRedisCacheKey } from "../common/helpers/redis.helpers";
import { RedisCacheNames } from "../common/enum/cacheTypes.enum";
import { RedisService } from "../redis/redis.service";


@Injectable()
export class AnalyticsService {
    constructor(
        @InjectModel(AnalyticsLog.name) private analyticsLogModel: Model<AnalyticsLog>,
        @InjectModel(Analytics.name) private analyticsModel: Model<Analytics>,
        @InjectModel(ShortURL.name) private shortURLModel: Model<ShortURL>,
        private readonly redis: RedisService
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

    /**
     * Function to create analytics report for alias provided
     * @param alias 
     * @returns AnalysticsResponse
     */
    async getAliasAnalytics(alias: string): Promise<AnalysticsResponse> {
        let key: string = generateRedisCacheKey(`alias:${alias}`, RedisCacheNames.Analytics)

        const cachedData: any = await this.redis.get(key);
        if (cachedData) {
            return cachedData
        }

        const shortURL: ShortURL = await this.shortURLModel.findOne({ alias })
        if (!shortURL) {
            throw new NotFoundException(analyticsErrorMessages.ALIAS_NOT_FOUND)
        }
        const result: AnalysticsResponse[] = await this.shortURLModel.aggregate([
            {
                $lookup: {
                    from: 'analyticslogs',
                    as: 'analyticslogs',
                    localField: '_id',
                    foreignField: 'shortURLId',
                }
            },
            {
                $match: { alias },
            },
            {
                $lookup: {
                    from: 'analytics',
                    as: 'analytics',
                    localField: '_id',
                    foreignField: 'shortURLId',
                    pipeline: [
                        {
                            $project: {
                                totalClicks: 1,
                                uniqueClicks: 1,
                            }
                        }
                    ]
                }
            },
            {
                $unwind: "$analyticslogs"
            },
            {
                $facet: {
                    osType: [
                        {
                            $group: {
                                _id: "$analyticslogs.osType",
                                uniqueClicks: { $addToSet: "$analyticslogs.userId" },
                                totalClicks: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                osName: "$_id",
                                uniqueClicks: { $size: "$uniqueClicks" },
                                uniqueUsers: { $size: "$uniqueClicks" },
                                totalClicks: 1,
                                _id: 0
                            }
                        }
                    ],
                    deviceType: [
                        {
                            $group: {
                                _id: "$analyticslogs.deviceType",
                                uniqueClicks: { $addToSet: "$analyticslogs.userId" },
                                totalClicks: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                deviceName: "$_id",
                                uniqueClicks: { $size: "$uniqueClicks" },
                                uniqueUsers: { $size: "$uniqueClicks" },
                                totalClicks: 1,
                                _id: 0
                            }
                        }
                    ],
                    analytics: [
                        {
                            $unwind: "$analytics"
                        },
                        {
                            $project: {
                                uniqueClicks: "$analytics.uniqueClicks",
                                totalClicks: "$analytics.totalClicks"
                            }
                        }
                    ],
                    clickByDate: [
                        {
                            $match: {
                                "analyticslogs.createdAt": {
                                    $gte: new Date(new Date().setDate(new Date().getDate() - 7))
                                }
                            }
                        },
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m-%d", date: "$analyticslogs.createdAt" } },
                                totalClicks: { $sum: 1 }
                            }
                        },
                        {
                            $sort: { "_id": -1 }
                        },
                        {
                            $project: {
                                date: "$_id",
                                clickCount: "$totalClicks",
                                _id: 0
                            }
                        },
                        {
                            $limit: 7
                        }
                    ]
                }
            },
            {
                $project: {
                    osType: 1,
                    deviceType: 1,
                    uniqueClicks: { $arrayElemAt: ["$analytics.uniqueClicks", 0] },
                    totalClicks: { $arrayElemAt: ["$analytics.totalClicks", 0] },
                    clickByDate: 1
                }
            }
        ])
        await this.redis.set(key, JSON.stringify(result[0]), 200)

        return result[0]
    }

}