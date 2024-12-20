import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RefreshTokenDto {
    @ApiProperty({
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NjQ2YzcwMjk5YjhhODI1MGFmYTg5YiIsImlhdCI6MTczNDYzNzI4MCwiZXhwIjoxNzM0NzIzNjgwfQ",
        required: true
    })
    @IsNotEmpty()
    @IsString()
    refreshToken: string;

}