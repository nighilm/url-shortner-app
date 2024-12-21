import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "../../../auth/entities/user.schema";
import { ShortURL } from "../../entities/short-url.schema";

@Schema({ timestamps: true })
export class AnalyticsLog extends Document {

    @Prop({ required: true, type: Types.ObjectId, ref: ShortURL.name })
    shortURLId: ShortURL;

    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    userId: User;

    @Prop({ required: true })
    userAgent: string;

    @Prop({ required: false })
    ipAddress: string;

    @Prop({ required: true })
    osType: string;

    @Prop({ required: true })
    deviceType: string;

    @Prop()
    createdAt: Date;
}

export const AnalyticsLogSchema = SchemaFactory.createForClass(AnalyticsLog)

