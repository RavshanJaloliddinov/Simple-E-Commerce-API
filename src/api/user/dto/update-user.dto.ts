import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, Matches, MinLength } from 'class-validator';
import { Roles } from 'src/common/database/Enums';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({ example: 'Updated Name', description: 'User name', required: false })
    name?: string;

    @ApiProperty({ example: 'newemail@example.com', description: 'User email', required: false })
    email?: string;

    @ApiProperty({ example: 'NewPassword123!', description: 'User password', required: false })
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    password?: string;

    @ApiProperty({ example: Roles.USER, description: 'User role', enum: Roles, required: false })
    @IsEnum(Roles, { message: 'Invalid role' })
    role?: Roles;
}
