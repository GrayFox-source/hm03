import {loginInputModel} from "../models/Auth/LoginInputModel";
import {usersService} from "./users-service";
import bcrypt from "bcrypt";
import {UserDBModel} from "../models/User/UserViewModel";
import {MeViewModel} from "../models/Me/MeViewModel";

export const authService = {
    async authUser(dto: loginInputModel): Promise< UserDBModel  | null> {
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
            passwordHash: user.passwordHash,
            createdAt: user.createdAt,
        };
    },
    async getUserInfo(dto: MeViewModel): Promise<MeViewModel> {
        console.log('userid', dto)
        return {
            email: dto.email,
            login: dto.login,
            userId: dto.userId,
        }
    }
}