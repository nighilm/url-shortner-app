import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateShortURLDto {
    @ApiProperty({
        example: "https://www.google.com/",
        required: true
    })
    @IsNotEmpty()
    @IsString()
    longURL: string;

    @ApiProperty({
        example: "gglAlias",
        required: false
    })
    @IsString()
    customAlias: string;

    @ApiProperty({
        example: "6765cc8da23a94f51a40dcb0",
        required: false
    })
    @IsString()
    topic: string;

}

export class ShortURLResponseDto {
    shortURL: string;
    createdAt: Date;
}