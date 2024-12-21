import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "../../../auth/entities/user.schema";
import { ShortURL } from "../../entities/short-url.schema";

@Schema({ timestamps: true })
export class Analytics extends Document {

    @Prop({ required: true, type: Types.ObjectId, ref: ShortURL.name })
    shortURLId: ShortURL;

    @Prop({ required: true })
    uniqueClicks: number;

    @Prop({ required: true })
    totalClicks: number;

    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    uniqueUsers: Types.ObjectId[];

}

export const AnalyticsSchema = SchemaFactory.createForClass(Analytics)