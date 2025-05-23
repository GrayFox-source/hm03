import {Router} from "express";
import {RequestWithBody} from "../../types";
import {LoginInputModel} from "../../models/Login/LoginInputModel";
import {authService} from "../../domain/auth-service";
import {jwtService} from "../../application/jwt/jwtService";
import {authMiddleware} from "../../middlewares/input-validation-middleware";


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
