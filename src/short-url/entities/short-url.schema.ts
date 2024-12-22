import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Topic } from "./topic.schema";
import { User } from "../../auth/entities/user.schema";

@Schema({ timestamps: true })
export class ShortURL extends Document {

    @Prop({ required: true })
    longURL: string;

    @Prop({ required: true })
    shortURL: string;

    @Prop({ required: true, unique: true })
    alias: string;

    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    userId: User;

    @Prop({ required: false, type: Types.ObjectId, ref: Topic.name })
    topicId: Topic;

    @Prop()
    createdAt: Date;
}

export const ShortURLSchema = SchemaFactory.createForClass(ShortURL)