import {Router} from "express";
import {RequestWithBody, RequestWithQuery} from "../../types";
import {LoginInputModel} from "../../models/Login/LoginInputModel";
import {authService} from "../../domain/auth-service";
import {jwtService} from "../../application/jwt/jwtService";
import {authMiddleware} from "../../middlewares/input-validation-middleware";
import {RegistrationInputModel} from "../../models/Auth/RegistrationInputModel";
import {
    EmailResendingModel,
    ResistrationConfirmationCodeModel
} from "../../models/Auth/ResistrationConfirmationCodeModel";


export const authRouter = Router();

authRouter.post('/login', async (req: RequestWithBody<LoginInputModel>, res) => {
    const body: LoginInputModel = req.body;

    const errors: Array<{ message: string; field: string }> = [];

    if (!body.loginOrEmail || body.loginOrEmail.trim() === '') {
        errors.push({message: 'loginOrEmail is required', field: 'loginOrEmail'});
    }

    if (!body.password || body.password.trim() === '') {
        errors.push({message: 'password is required', field: 'password'});
    }

    if (errors.length > 0) {
        res.status(400).json({errorsMessages: errors});
        return
    }

    const result = await authService.authUser(body);

    if (!result) {
        res.status(401).send('Unauthorized');
        return
    }

    const token = await jwtService.createJwtForUser(result)
    res.status(201).send(token);

});

authRouter.get('/me',
    authMiddleware,
    async (req, res) =>  {
    const userInfo = await authService.getUserInfo({email: req.user!.email, login: req.user!.login, userId: req.user!.id})
    res.status(200).send(userInfo)
})

authRouter.post('/registration',
    async (req: RequestWithBody<RegistrationInputModel>, res) => {
    const data = await authService.registerUser(req.body)
    if (typeof data == "boolean") {
        res.sendStatus(204)
    } else {
        res.status(400).send(data)
    }
})

authRouter.get('/registration-confirmation', async (req: RequestWithQuery<ResistrationConfirmationCodeModel>, res) => {
    const data = await authService.userConfirmation({code: req.query.code})
    if (typeof data === "boolean") {
        res.sendStatus(204)
    } else {
        res.status(400).send(data)
    }
})

authRouter.post('/registration-email-resending', async (req: RequestWithBody<EmailResendingModel>, res) => {
    const data = await authService.emailResending(req.body)
    if (typeof data === 'boolean') {
        res.sendStatus(204)
    } else {
        res.status(400).send(data)
    }
})
