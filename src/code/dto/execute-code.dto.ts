import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ExecuteCodeDto {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsNumber()
    platform: number;

    @IsString()
    input: string;
}