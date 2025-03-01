import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class CustomMailerService {
    constructor(private readonly mailerService: MailerService) {}

    async sendPasswordResetEmail(email: string, resetToken: string) {
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        await this.mailerService.sendMail({
            to: email,
            subject: "Password Reset Request",
            text: `Click the link to reset your password: ${resetLink}`,
        });

        return { message: "Password reset email sent successfully." };
    }
}
