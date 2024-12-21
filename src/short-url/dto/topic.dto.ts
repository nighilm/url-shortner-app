import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateTopicDto {
    @ApiProperty({
        example: "Acquisition",
        required: true
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        example: "Topic description",
        required: false
    })
    @IsString()
    description: string;

}