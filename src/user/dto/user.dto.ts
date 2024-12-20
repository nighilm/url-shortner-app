import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UserProfileUpdateDto {
    @ApiProperty({
        example: "Updated Name",
        required: false
    })
    @IsString()
    name: string;

}