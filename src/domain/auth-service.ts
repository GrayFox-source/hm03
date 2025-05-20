import {loginInputModel} from "../models/Auth/LoginInputModel";
import {usersService} from "./users-service";
import bcrypt from "bcrypt";

export const authService = {
    async authUser(dto: loginInputModel): Promise<{ userId: string } | null> {
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
            userId: user.id,
        };
    }
}