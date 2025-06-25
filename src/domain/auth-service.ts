import {loginInputModel} from "../models/Auth/LoginInputModel";
import {usersService} from "./users-service";
import bcrypt from "bcrypt";
import {UserViewModel} from "../models/User/UserViewModel";
import {MeViewModel} from "../models/Me/MeViewModel";
import {RegistrationInputModel} from "../models/Auth/RegistrationInputModel";
import {ErrorFieldViewModel} from "../models/ErrorFieldViewModel";
import {EmailResendingModel, ResistrationConfirmationCodeModel} from "../models/Auth/ResistrationConfirmationCodeModel";
import {mailerAdapter} from "../adapter/Mailer-adapter";

export const authService = {
    async authUser(dto: loginInputModel): Promise< UserViewModel  | null> {
        const {loginOrEmail, password} = dto;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const loginRegex = /^[a-zA-Z0-9_-]*$/;

        const isEmail = emailRegex.test(loginOrEmail);
        const isLogin = loginRegex.test(loginOrEmail)

        let user;

        if (isEmail) {
            user = await usersService.findUserByEmail(loginOrEmail);
        } else if (isLogin) {
            let userService;
            user = await usersService.findUserByLogin(loginOrEmail);
        }

        if (!user) {
            return null;
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isValidPassword) {
            return null;
        }

        return {
            id: user.id,
            login: user.login,
            email: user.email,
            createdAt: user.createdAt,
        };
    },
    async getUserInfo(dto: MeViewModel): Promise<MeViewModel> {
        return {
            email: dto.email,
            login: dto.login,
            userId: dto.userId,
        }
    },
    async registerUser(dto: RegistrationInputModel): Promise<boolean | ErrorFieldViewModel[]> {
        const errorField: ErrorFieldViewModel[] = [];
        const confirmationCode = String(+(new Date()))
        const [findUserByEmail, findUserByLogin] = await Promise.all([
            usersService.findUserByEmail(dto.email),
            usersService.findUserByLogin(dto.login)
        ]);
        if (findUserByEmail) {
            errorField.push({error: 'dolbaeb user with this email is already exist', field: dto.email})
            return errorField
        }
        if (findUserByLogin) {
            errorField.push({error: 'dolbaeb user with this login is already exist', field: dto.login})
            return errorField
        }
        const newUser = {
            login: dto.login,
            password: dto.password,
            email: dto.email
        }
        await usersService.createNewUser(newUser, confirmationCode)
        try {
            await mailerAdapter.sendMailConfirmationCode(dto.email, confirmationCode)
        } catch (error) {
            console.error(error)
            await usersService.deleteUserByEmail(newUser.email)
            return false
        }

        return true
    },
    async userConfirmation(code: ResistrationConfirmationCodeModel) {
        return await usersService.updateUserByCode(code)
    },
    async emailResending(email: EmailResendingModel): Promise<boolean | ErrorFieldViewModel[]> {
        const errorField: ErrorFieldViewModel[] = [];
        const user = await usersService.findUserByEmail(email.email)
        if (!user) {
            errorField.push({error: 'Have a problem, this user is not existing', field: email.email})
            return errorField
        }
        const resendingEmailConfirmationCode = await mailerAdapter.sendMailConfirmationCode(email.email, user?.emailConfirmation.confirmationCode)
        return true
    }
}