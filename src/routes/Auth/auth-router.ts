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
import {usersCollection} from "../../repositories/db";
import {JwtPayload} from "jsonwebtoken";



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

    const accessToken = await jwtService.createJwtForUser(result)
    const refreshToken = await jwtService.createRefreshToken(result)
    res.cookie("refreshToken", refreshToken, {httpOnly: true})
    res.status(201).send(accessToken);

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
    if (data === true) {
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

authRouter.post('/refresh-token', async (req, res) => {
    const cookie_refresh = req.cookies.refreshToken
    if (!cookie_refresh) {
        res.status(401).send("Unauthorized")
        return
    }

    try {
        const decoded = await jwtService.verifyUser(cookie_refresh.refreshToken) as JwtPayload
        const refreshTokenRecord = await jwtService.refreshTokenRecord(cookie_refresh.refreshToken, decoded.userId)
        if (refreshTokenRecord === null) {
            res.status(401).send('Unauthorized');
            return
        }
        const user = await usersCollection.findOne({ id: decoded.userId });
        if (!user) {
            res.status(401).send('Unauthorized');
            return
        }
        const accessToken = await jwtService.createJwtForUser(decoded.userId);
        const updatedRefresh = await jwtService.updateRefreshToken(user, cookie_refresh.refreshToken)
        if (!updatedRefresh) {
            res.status(500).send('Internal Error')
            return
        }

        res.cookie('refreshToken', updatedRefresh, {
            httpOnly: true,
        });

        // Отправить access token
        res.status(200).send(accessToken);

    } catch (error) {
        console.error(error);
        res.status(401).send('Unauthorized');
    }
})

authRouter.post('/logout', async (req, res) => {
    const cookie_refresh = req.cookies.refreshToken
    if (!cookie_refresh) {
        res.status(401).send("Unauthorized")
        return
    }

    try {
        const deleted = await jwtService.deleteRefreshToken(cookie_refresh.refreshToken);
        if (!deleted) {
            res.status(401).send('Unauthorized');
            return
        }

        // 204 No content
        res.status(204).send();

    } catch (error) {
        console.error(error);
        res.status(401).send('Unauthorized');
    }
})
