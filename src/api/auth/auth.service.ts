import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { config } from "src/config";
import { RegisterDto } from "./dto/register.dto";
import { BcryptEncryption } from "src/infrastructure/bcrypt";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from "typeorm";
import { UserEntity } from "src/core/entity";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { CustomMailerService } from "src/infrastructure/mail/mail.service";
import { RedisCacheService } from "src/infrastructure/redis/redis.service";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisCacheService,
        private readonly customMailerService: CustomMailerService
    ) { }

    // Register a new user
    async register(registerDto: RegisterDto) {
        const { email, password, name } = registerDto
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new UnauthorizedException("Email already registered.");
        }

        const hashedPassword = await BcryptEncryption.encrypt(password)

        const user = this.userRepository.create({ email, password: hashedPassword, name });
        await this.userRepository.save(user);

        return this.generateTokens(user.id, user.email, user.role);
    }

    // User login
    async login(email: string, password: string) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new UnauthorizedException("Invalid email or password.");
        }

        const isPasswordValid = await BcryptEncryption.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException("Invalid email or password.");
        }

        return this.generateTokens(user.id, user.email, user.role);
    }


    async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
        const { currentPassword, newPassword } = updatePasswordDto;

        // Foydalanuvchini ID bo‘yicha topish
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new UnauthorizedException("User not found.");
        }

        // Eski parolni tekshirish
        const isPasswordValid = await BcryptEncryption.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException("Current password is incorrect.");
        }

        // Yangi parolni xeshlab saqlash
        const hashedNewPassword = await BcryptEncryption.encrypt(newPassword);
        user.password = hashedNewPassword;
        await this.userRepository.save(user);

        return { message: "Password updated successfully." };
    }


    async forgotPassword(email: string) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new NotFoundException("User with this email not found.");
        }
    
        const resetToken = this.jwtService.sign(
            { id: user.id, email: user.email },
            { secret: config.ACCESS_TOKEN_EXPIRE_TIME, expiresIn: "15m" }
        );
    
        await this.redisService.set(`reset_token:${user.id}`, resetToken, 900);
    
        // Yangi MailerService funksiyasidan foydalanish
        await this.customMailerService.sendPasswordResetEmail(user.email, resetToken);
    
        return { message: "Password reset link sent to email." };
    }
    

    async resetPassword(token: string, newPassword: string) {
        let payload;
        try {
            payload = this.jwtService.verify(token, {
                secret: config.ACCESS_TOKEN_SECRET_KEY,
            });
        } catch (error) {
            throw new UnauthorizedException("Invalid or expired token.");
        }

        const savedToken = await this.redisService.get(`reset_token:${payload.id}`);
        if (!savedToken || savedToken !== token) {
            throw new UnauthorizedException("Invalid or expired token.");
        }

        const user = await this.userRepository.findOne({ where: { id: payload.id } });
        if (!user) {
            throw new NotFoundException("User not found.");
        }

        user.password = await BcryptEncryption.encrypt(newPassword);
        await this.userRepository.save(user);

        await this.redisService.deleteByText(`reset_token:${payload.id}`);

        return { message: "Password has been reset successfully." };
    }



    // Refresh the access token using refresh token
    async refreshToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: config.REFRESH_TOKEN_SECRET_KEY,
            });

            const user = await this.userRepository.findOne({ where: { id: payload.id } });
            if (!user) {
                throw new UnauthorizedException("User not found.");
            }

            return this.generateTokens(user.id, user.email, user.role);
        } catch (error) {
            throw new UnauthorizedException("Invalid refresh token.");
        }
    }

    // Generate access and refresh tokens
    private generateTokens(userId: string, email: string, role: string) {
        const payload = { id: userId, email, role };

        const accessToken = this.jwtService.sign(payload, {
            secret: config.ACCESS_TOKEN_SECRET_KEY,
            expiresIn: config.ACCESS_TOKEN_EXPIRE_TIME,
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: config.REFRESH_TOKEN_SECRET_KEY,
            expiresIn: config.REFRESH_TOKEN_EXPIRE_TIME,
        });

        return {
            accessToken,
            refreshToken,
        };
    }

}
