
import {UserDBModel} from "../models/User/UserViewModel"; // Замени на твой реальный тип пользователя

declare global {
    declare namespace Express {
        declare interface Request {
            user?: UserDBModel | null
        }
    }
}