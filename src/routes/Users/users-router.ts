import {Router} from "express";
import * as validation from "../../middlewares/input-validation-middleware";
import {authorisedCheckValidator, InputUserPasswordValidation} from "../../middlewares/input-validation-middleware";
import {requestLoggerMiddleware} from "../../middlewares/rate-limit";
import {container} from "../../compositon-root";
import {UsersController} from "./users-controller";

export const usersRouter = Router()

// const usersController = ioc.getInstance<UsersController>(UsersController)

const usersController = container.get(UsersController)

usersRouter.get('/',
    authorisedCheckValidator,
    requestLoggerMiddleware,
    usersController.getAllUsers.bind(usersController))

usersRouter.post('/',
    authorisedCheckValidator,
    InputUserPasswordValidation,
    requestLoggerMiddleware,
    usersController.createNewUser.bind(usersController))

usersRouter.delete('/:id',
    validation.authorisedCheckValidator,
    usersController.deleteUser.bind(usersController))