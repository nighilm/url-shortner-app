import { Injectable, NotFoundException } from "@nestjs/common";
import { AnalyticsLog } from "./entities/analyticsLog.schema";
import { parseDataFromRequest } from "../common/helpers/uaParser.helper";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Analytics } from "./entities/analytics.schema";
import { ShortURL } from "../short-url/entities/short-url.schema";
import { analyticsErrorMessages } from "../common/constants/error.constants";
import { AnalysticsAliasResponse, AnalysticsOverallResponse, AnalysticsTopicResponse } from "./interface/analytics.interface";
import { generateRedisCacheKey } from "../common/helpers/redis.helpers";
import { RedisCacheNames } from "../common/enum/cacheTypes.enum";
import { RedisService } from "../redis/redis.service";
import { Topic } from "../short-url/entities/topic.schema";


@Injectable()
export class AnalyticsService {
    constructor(
        @InjectModel(AnalyticsLog.name) private analyticsLogModel: Model<AnalyticsLog>,
        @InjectModel(Analytics.name) private analyticsModel: Model<Analytics>,
        @InjectModel(ShortURL.name) private shortURLModel: Model<ShortURL>,
        @InjectModel(Topic.name) private topicModel: Model<Topic>,
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

        const shortURLrecord: any[] = await this.shortURLModel.aggregate([
            {
                $match: { _id: shortURLId }
            },
            {
                $lookup: {
                    from: "topics",
                    as: "topics",
                    foreignField: "_id",
                    localField: "topicId"
                }
            },
            {
                $project: {
                    _id: 0,
                    alias: 1,
                    topic: { $arrayElemAt: ["$topics.name", 0] },
                }
            }
        ])

        let redisKeyClear: string[] = [
            `${RedisCacheNames.Analytics}:overall:${userId}`,
            `${RedisCacheNames.Analytics}:alias:${shortURLrecord[0]?.alias}`,
            `${RedisCacheNames.Analytics}:topic:${shortURLrecord[0]?.topic}`
        ]
        await this.redis.delMultiple(redisKeyClear)
    }

    /**
     * Function to create analytics report for alias provided
     * @param alias 
     * @returns AnalysticsAliasResponse
     */
    async getAliasAnalytics(alias: string): Promise<AnalysticsAliasResponse> {
        let key: string = generateRedisCacheKey(`alias:${alias}`, RedisCacheNames.Analytics)

        const cachedData: any = await this.redis.get(key);
        if (cachedData) {
            return cachedData
        }

        const shortURL: ShortURL = await this.shortURLModel.findOne({ alias })
        if (!shortURL) {
            throw new NotFoundException(analyticsErrorMessages.ALIAS_NOT_FOUND)
        }
        const result: AnalysticsAliasResponse[] = await this.shortURLModel.aggregate([
            {
                $match: { alias },
            },
            {
                $lookup: {
                    from: 'analyticslogs',
                    as: 'analyticslogs',
                    localField: '_id',
                    foreignField: 'shortURLId',
                }
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

    /**
     * Function to create analytics report for topic provided
     * @param topic 
     * @returns AnalysticsAliasResponse
     */
    async getTopicAnalytics(topic: string): Promise<AnalysticsTopicResponse> {
        let key: string = generateRedisCacheKey(`topic:${topic}`, RedisCacheNames.Analytics)

        const cachedData: any = await this.redis.get(key);
        if (cachedData) {
            return cachedData
        }

        const topicRecord: Topic = await this.topicModel.findOne({ name: topic })

        if (!topicRecord) {
            throw new NotFoundException(analyticsErrorMessages.TOPIC_NOT_FOUND)
        }

        const result: AnalysticsTopicResponse[] = await this.shortURLModel.aggregate([
            {
                $match: { topicId: topicRecord._id },
            },
            {
                $lookup: {
                    from: 'analyticslogs',
                    as: 'analyticslogs',
                    localField: '_id',
                    foreignField: 'shortURLId',
                }
            },
            {
                $unwind: "$analyticslogs"
            },
            {
                $facet: {
                    counts: [
                        {
                            $group: {
                                _id: null,
                                uniqueClicks: { $addToSet: "$analyticslogs.userId" },
                                totalClicks: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                uniqueClicks: { $size: "$uniqueClicks" },
                                totalClicks: 1,
                                _id: 0
                            }
                        }
                    ],
                    clickByDate: [
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
                    ],
                    urls: [
                        {
                            $group: {
                                _id: "$shortURL",
                                uniqueClicks: { $addToSet: "$analyticslogs.userId" },
                                totalClicks: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                shortURL: "$_id",
                                uniqueClicks: { $size: "$uniqueClicks" },
                                totalClicks: 1,
                                _id: 0
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    totalClicks: { $arrayElemAt: ["$counts.totalClicks", 0] },
                    uniqueClicks: { $arrayElemAt: ["$counts.uniqueClicks", 0] },
                    clickByDate: 1,
                    urls: 1
                }
            }
        ])
        await this.redis.set(key, JSON.stringify(result[0]), 200)

        return result[0]
    }

    /**
     * Function to create overall analytics report for user
     * @param topic 
     * @returns AnalysticsAliasResponse
     */
    async getOverallAnalytics(userId: string | Types.ObjectId): Promise<any> {
        let key: string = generateRedisCacheKey(`overall:${userId}`, RedisCacheNames.Analytics)
        userId = new Types.ObjectId(userId)

        const cachedData: any = await this.redis.get(key);
        if (cachedData) {
            return cachedData
        }

        let result: AnalysticsOverallResponse[] = await this.shortURLModel.aggregate([
            {
                $match: { userId },
            },
            {
                $lookup: {
                    from: 'analyticslogs',
                    as: 'analyticslogs',
                    localField: '_id',
                    foreignField: 'shortURLId',
                }
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
                    urls: [
                        {
                            $group: {
                                _id: null,
                                totalURLs: { $addToSet: "$_id" },
                            }
                        },
                        {
                            $project: {
                                totalURLs: { $size: "$totalURLs" },
                                _id: 0
                            }
                        }
                    ],
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
                            $group: {
                                _id: null,
                                uniqueClicks: { $addToSet: "$analyticslogs.userId" },
                                totalClicks: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                uniqueClicks: { $size: "$uniqueClicks" },
                                totalClicks: { $sum: "$totalClicks" },
                                _id: 0
                            }
                        },
                    ],
                    clickByDate: [
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
                    ]
                }
            },
            {
                $project: {

                    osType: 1,
                    deviceType: 1,
                    uniqueClicks: { $arrayElemAt: ["$analytics.uniqueClicks", 0] },
                    totalClicks: { $arrayElemAt: ["$analytics.totalClicks", 0] },
                    clickByDate: 1,
                    totalURLs: { $arrayElemAt: ["$urls.totalURLs", 0] }
                }
            }
        ])
        let urlCount: any[] = await this.shortURLModel.aggregate([
            {
                $match: { userId },
            },
            {
                $count: "totalURLs"
            }
        ])
        result[0].totalURLs = urlCount[0].totalURLs

        await this.redis.set(key, JSON.stringify(result[0]), 200)

        return result
    }

}