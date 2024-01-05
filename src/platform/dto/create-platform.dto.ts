import { ApiProperty } from "@nestjs/swagger";

export class CreatePlatformDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    dockerImage: string;

    @ApiProperty()
    fileExt: string;

    @ApiProperty({ required: false })
    buildCommand?: string;

    @ApiProperty({ required: false })
    fileBuiltExt?: string;

    @ApiProperty()
    execCommand: string;
}
