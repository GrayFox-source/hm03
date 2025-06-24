import nodemailer from "nodemailer";


export const mailerAdapter = {
    async sendMailConfirmationCode(email: string, confirmationCode: string) {
        const transporter = nodemailer.createTransport({
            host: 'smtp.mail.ru',
            port: 465,
            secure: true,
            auth: {
                user: 'ilya.soft.1995@mail.ru',
                pass: 'iIXjXQOkmP8P39atk63I'
            }
        });

        await transporter.sendMail({
            from: '"Ilya Dobrich" <ilya.soft.1995@mail.ru>', // ✅ Правильный формат
            to: email,
            subject: "Mail confirmation",
            html: `<h1>Please confirm your email</h1><p>Your confirmation code here: <a href="http://localhost:3003/auth/registration-confirmation?code=${confirmationCode}">${confirmationCode}</a></p>`,
        });
    }
}