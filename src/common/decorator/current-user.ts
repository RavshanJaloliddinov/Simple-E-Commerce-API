import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { config } from "src/config";

export const CurrentUser = createParamDecorator(
    async (_data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const authorizationHeader = request.headers.authorization;

        if (!authorizationHeader) {
            throw new UnauthorizedException("Token mavjud emas");
        }

        const token = authorizationHeader.split(" ")[1];
        if (!token) {
            throw new UnauthorizedException("Token noto'g'ri formatda");
        }

        try {
            const jwtService = new JwtService({
                secret: config.ACCESS_TOKEN_SECRET_KEY,
            });
            const decoded = jwtService.verify(token);
            return decoded;
        } catch (error) {
            throw new UnauthorizedException("Token yaroqsiz yoki muddati tugagan");
        }
    }
);
