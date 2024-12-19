import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class User extends Document {

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    googleId: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: false })
    profilePicture: string

}

export const UserSchema = SchemaFactory.createForClass(User)