import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { Roles } from 'src/common/database/Enums';

export class CreateUserDto {
    @ApiProperty({ example: 'John Doe', description: 'User name' })
    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @ApiProperty({ example: 'john@example.com', description: 'User email' })
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @ApiProperty({ example: 'Password123!', description: 'User password' })
    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    password: string;

    @ApiProperty({ example: Roles.USER, description: 'User role', enum: Roles, default: Roles.USER })
    @IsOptional()
    @IsEnum(Roles, { message: 'Invalid role' })
    role?: Roles;
}
