import { IsNotEmpty, IsString } from "class-validator";

export class ExecuteCodeDto {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    platform: string;

    @IsString()
    input: string;
}