import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { User } from "../auth/entities/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { userErrorMessages } from "../common/constants/error.constants";
import { UserDetails } from "./interface/user.interface";

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
    ) { }
    private logger = new Logger(UserService.name)

    /**
     * Function to fetch user details by user id
     * @param userId 
     * @returns user data
     */
    async getUserProfile(userId: string | Types.ObjectId): Promise<User> {
        userId = new Types.ObjectId(userId)
        const user: User = await this.userModel.findById(userId, { id: "$_id", name: 1, email: 1, profilePicture: 1, _id: 0 })
        if (!user) {
            throw new NotFoundException(userErrorMessages.USER_NOT_FOUND)
        }
        return user
    }

    /**
     * Function to update the user data by user id
     * @param userId 
     * @param userDetails 
     * @returns 
     */
    async updateUserProfile(userId: string | Types.ObjectId, userDetails: Partial<UserDetails>): Promise<any> {
        userId = new Types.ObjectId(userId)
        const user: User = await this.userModel.findById(userId)
        if (!user) {
            throw new NotFoundException(userErrorMessages.USER_NOT_FOUND)
        }
        await this.userModel.updateOne({ _id: userId }, { name: userDetails.name })
        return
    }
}