import {Router} from "express";
import {RequestWithBody} from "../types";
import {LoginInputModel} from "../models/Login/LoginInputModel";
import {authService} from "../domain/auth-service";

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

    res.status(204).send();
});
