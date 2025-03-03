import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsDefined } from 'class-validator';

export class RegisterDto {
    @ApiProperty({
        example: 'John Doe',
        description: 'Foydalanuvchining to‘liq ismi',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: 'example@example.com',
        description: 'Foydalanuvchi email manzili',
    })
    @IsEmail({}, { message: 'Email manzil noto‘g‘ri formatda' })
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'StrongPassword123!',
        description: 'Foydalanuvchi paroli',
    })
    @IsString()
    @MinLength(8, { message: 'Parol kamida 8 ta belgidan iborat bo‘lishi kerak' })
    @MaxLength(32, { message: 'Parol maksimal 32 ta belgidan oshmasligi kerak' })
    @Matches(/(?=.*[a-z])/, { message: 'Parolda kamida bitta kichik harf bo‘lishi kerak' })
    @Matches(/(?=.*[A-Z])/, { message: 'Parolda kamida bitta katta harf bo‘lishi kerak' })
    @Matches(/(?=.*\d)/, { message: 'Parolda kamida bitta raqam bo‘lishi kerak' })
    @IsNotEmpty()
    password: string;
}
