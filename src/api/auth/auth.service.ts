import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { config } from "src/config";
import { RegisterDto } from "./dto/register.dto";
import { BcryptEncryption } from "src/infrastructure/lib/bcrypt";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from "typeorm";
import { UserEntity } from "src/core/entity";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly jwtService: JwtService
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
