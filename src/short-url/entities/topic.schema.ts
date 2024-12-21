import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Topic extends Document {

    @Prop({ required: true })
    name: string;

    @Prop({ required: false })
    description: string;

    @Prop({ default: false })
    isDeleted: Boolean;

}

export const TopicSchema = SchemaFactory.createForClass(Topic)