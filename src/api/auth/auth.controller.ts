import { Body, Controller, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ApiBody, ApiTags, ApiResponse } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { Public } from "src/common/decorator/public.decorator";
import { JwtAuthGuard } from "./users/AuthGuard";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("register")
  @Public()
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: "User registered successfully." })
  @ApiResponse({ status: 400, description: "Bad Request." })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("login")
  @Public()
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: "Login successful." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async login(@Body() { email, password }: LoginDto) {
    return this.authService.login(email, password);
  }

  @Post("refresh")
  @Public()
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: "Access token refreshed successfully." })
  @ApiResponse({ status: 401, description: "Invalid refresh token." })
  async refreshToken(@Body() { refreshToken }: RefreshTokenDto) {
    return this.authService.refreshToken(refreshToken);
  }

  // Parol yangilash
  @Put("update-password")
  @UseGuards(JwtAuthGuard) // Token orqali foydalanuvchini aniqlash
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({ status: 200, description: "Password updated successfully." })
  @ApiResponse({ status: 401, description: "Current password is incorrect." })
  async updatePassword(@Req() req, @Body() updatePasswordDto: UpdatePasswordDto) {
    const userId = req.user.id;  // Token orqali foydalanuvchi ID'sini olish
    return this.authService.updatePassword(userId, updatePasswordDto);
  }
}
