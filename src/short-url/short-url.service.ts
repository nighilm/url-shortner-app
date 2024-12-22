import { BadRequestException, Injectable, Logger, NotFoundException, } from "@nestjs/common";
import { User } from "../auth/entities/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Topic } from "./entities/topic.schema";
import { ShortURL } from "./entities/short-url.schema";
import { CreateShortURLDto, ShortURLResponseDto } from "./dto/short-url.dto";
import { RedisService } from "src/redis/redis.service";
import ShortUniqueId from "short-unique-id";
import { generateRedisCacheKey } from "../common/helpers/redis.helpers";
import { RedisCacheNames } from "src/common/enum/cacheTypes.enum";

@Injectable()
export class ShortURLService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Topic.name) private topicModel: Model<Topic>,
        @InjectModel(ShortURL.name) private shortURLModel: Model<ShortURL>,
        private readonly redis: RedisService
    ) { }
    private logger = new Logger(ShortURLService.name)

    /**
     * Function to create topic
     * @param topicData 
     * @returns topic id
     */
    async createTopic(topicData: { name: string, description: string }): Promise<string> {
        let topic: Topic = await this.topicModel.findOne({ name: topicData.name, isDeleted: false })
        if (topic) {
            throw new BadRequestException("Topic already exists")
        }
        topic = await this.topicModel.create(topicData)
        return topic.id
    }

    /**
     * Function to fetch all topic list
     * @returns topic list
     */
    async getTopics(): Promise<Topic[]> {
        const topics: Topic[] = await this.topicModel.find({ isDeleted: false }, { id: "$_id", name: 1, description: 1, _id: 0 })
        return topics
    }

    /**
     * Function tp create new short url
     * @param userId 
     * @param baseURL 
     * @param { longURL, customAlias, topic } 
     * @returns short url and created date
     */
    async createShortURL(userId: string | Types.ObjectId, baseURL: string, { longURL, customAlias, topic }: CreateShortURLDto): Promise<ShortURLResponseDto> {
        userId = new Types.ObjectId(userId)
        const { randomUUID } = new ShortUniqueId({ length: 8 });

        let alias: string = customAlias
        if (customAlias) {
            const aliasExist: ShortURL = await this.shortURLModel.findOne({ alias })
            if (aliasExist) {
                throw new BadRequestException("Alias already exits try new one")
            }
        }

        if (!customAlias) {
            let aliasExist: ShortURL
            let counter: number = 10
            do {
                alias = randomUUID(8)
                aliasExist = await this.shortURLModel.findOne({ alias })
                counter--
                if (counter <= 0) {
                    throw new BadRequestException("Failed to generate a unique alias after multiple attempts")
                }
            } while (aliasExist);
        }

        const shortURL = `${baseURL}/shorten/${alias}`;

        const shortURLCreate: ShortURL = await this.shortURLModel.create({
            longURL,
            userId,
            alias,
            topic,
        });
        let key: string = generateRedisCacheKey(alias, RedisCacheNames.ShortURL)
        await this.redis.set(key, JSON.stringify({ shortURLId: shortURLCreate.id, longURL }), 200)
        return { shortURL, createdAt: shortURLCreate.createdAt };
    }

    async redirectShortURL(alias: string, request: any) {
        let key: string = generateRedisCacheKey(alias, RedisCacheNames.ShortURL)

        const cachedData: any = await this.redis.get(key);
        if (cachedData && cachedData?.longURL) {
            return cachedData
        }

        let shortURLData: ShortURL = await this.shortURLModel.findOne({ alias }, { longURL: 1 })
        if (!shortURLData) {
            throw new NotFoundException("URL not found")
        }

        await this.redis.set(key, JSON.stringify({ shortURLId: shortURLData.id, longURL: shortURLData.longURL }), 200)
        return { shortURLId: shortURLData.id, longURL: shortURLData.longURL }
    }

}