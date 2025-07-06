import {Router} from "express";
import {authMiddleware} from "../../middlewares/input-validation-middleware";
import {requestLoggerMiddleware} from "../../middlewares/rate-limit";
import {container} from "../../compositon-root";
import {AuthController} from "./auth-controller";



export const authRouter = Router();

const authControllerInstance = container.get(AuthController)
console.log(authControllerInstance)

authRouter.post('/login',
    requestLoggerMiddleware,
    authControllerInstance.login.bind(authControllerInstance));

authRouter.get('/me',
    authMiddleware,
    requestLoggerMiddleware,
    authControllerInstance.getMeInfo.bind(authControllerInstance))

authRouter.post('/registration',
    authControllerInstance.registerUser.bind(authControllerInstance))

authRouter.get('/registration-confirmation',
    requestLoggerMiddleware,
    authControllerInstance.registrationConfirmation.bind(authControllerInstance))

authRouter.post('/registration-email-resending',
    requestLoggerMiddleware,
    authControllerInstance.registrationEmailResending.bind(authControllerInstance))

authRouter.post('/refresh-token',
    requestLoggerMiddleware,
    authControllerInstance.refreshToken.bind(authControllerInstance))

authRouter.post('/logout',
    requestLoggerMiddleware,
    authControllerInstance.logout.bind(authControllerInstance))
