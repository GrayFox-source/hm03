import {AuthService} from "../../application/auth-service";
import {JwtService} from "../../application/jwtService";
import {DevicesService} from "../../application/devices-service";
import {RequestWithBody, RequestWithQuery} from "../../types";
import {LoginInputModel} from "../../models/Login/LoginInputModel";
import {Request, Response} from "express";
import { v4 as uuidv4 } from 'uuid';
import {DeviceDBModel} from "../../models/Auth/DeviceModel";
import {RegistrationInputModel} from "../../models/Auth/RegistrationInputModel";
import {
    EmailResendingModel,
    ResistrationConfirmationCodeModel
} from "../../models/Auth/ResistrationConfirmationCodeModel";
import {JwtPayload} from "jsonwebtoken";
import {usersCollection} from "../../infrastucture/db";
import {inject, injectable} from "inversify";
import {PasswordRecoveryMailInputModel} from "../../models/Auth/PasswordRecoveryMailInputModel";
import {UsersService} from "../../application/users-service";
import {jwtService} from "../../compositon-root";
import {NewPasswordRecoveryInputModel} from "../../models/Auth/NewPasswordRecoveryInputModel";

@injectable()
export class AuthController {
    constructor(@inject(AuthService) private authService: AuthService,
                @inject(JwtService) private jwtService: JwtService,
                @inject(DevicesService) private devicesService: DevicesService,
                @inject(UsersService) private usersService: UsersService) {
    }

    async login(req: RequestWithBody<LoginInputModel>, res: Response) {
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

        const result = await this.authService.authUser(body);
        const deviceId = uuidv4()
        const userAgent = req.headers['user-agent'] || 'Unknown Device';
        const ip = req.ip || 'Unknown IP';

        if (!result) {
            res.status(401).send('Unauthorized');
            return
        }

        const device: DeviceDBModel = {
            ip,
            title: userAgent,
            lastActivateDate: String(new Date()),
            deviceId,
            userId: result!.id,
        };
        await this.devicesService.insertDevice(device)
        const accessToken = await this.jwtService.createJwtForUser(result)
        const refreshToken = await this.jwtService.createRefreshToken(result, deviceId)
        res.cookie("refreshToken", refreshToken, {httpOnly: true})
        res.status(201).send(accessToken);

    }

    async getMeInfo(req: Request, res: Response) {
        const userInfo = await this.authService.getUserInfo({
            email: req.user!.email,
            login: req.user!.login,
            userId: req.user!.id
        })
        res.status(200).send(userInfo)
    }

    async registerUser(req: RequestWithBody<RegistrationInputModel>, res: Response) {
        const data = await this.authService.registerUser(req.body)
        if (data === true) {
            res.sendStatus(204)
        } else {
            res.status(400).send(data)
        }
    }

    async registrationConfirmation(req: RequestWithQuery<ResistrationConfirmationCodeModel>, res: Response) {
        const data = await this.authService.userConfirmation({code: req.query.code})
        if (typeof data === "boolean") {
            res.sendStatus(204)
        } else {
            res.status(400).send(data)
        }
    }

    async registrationEmailResending(req: RequestWithBody<EmailResendingModel>, res: Response) {
        const data = await this.authService.emailResending(req.body)
        if (typeof data === 'boolean') {
            res.sendStatus(204)
        } else {
            res.status(400).send(data)
        }
    }

    async refreshToken(req: Request, res: Response) {
        const cookie_refresh = req.cookies.refreshToken
        if (!cookie_refresh) {
            res.status(401).send("Unauthorized")
            return
        }

        try {
            const decoded = await this.jwtService.verifyUser(cookie_refresh.refreshToken) as JwtPayload
            const refreshTokenRecord = await this.jwtService.refreshTokenRecord(cookie_refresh.refreshToken, decoded.userId)
            if (refreshTokenRecord === null) {
                res.status(401).send('Unauthorized');
                return
            }
            const user = await usersCollection.findOne({id: decoded.userId});
            if (!user) {
                res.status(401).send('Unauthorized');
                return
            }
            const updateActiveTime = await this.devicesService.updateActiveTimeOfSession(decoded.deviceId)
            if (!updateActiveTime) {
                res.status(500).send("Internal Error")
            }
            const accessToken = await this.jwtService.createJwtForUser(decoded.userId);
            const updatedRefresh = await this.jwtService.updateRefreshToken(user, decoded.deviceId, cookie_refresh.refreshToken)
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
    }

    async logout(req: Request, res: Response) {
        const cookie_refresh = req.cookies.refreshToken
        if (!cookie_refresh) {
            res.status(401).send("Unauthorized")
            return
        }

        try {
            const deleted = await this.jwtService.deleteRefreshToken(cookie_refresh.refreshToken);
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
    }

    async passwordRecovery(req: RequestWithBody<PasswordRecoveryMailInputModel>, res: Response) {
        const email = req.body.email

        const user = await this.usersService.findUserByEmail(email)
        if (!user) {
            res.sendStatus(404)
            return
        }
        const token = await jwtService.generateRecoveryCode(user.id)
        await this.authService.passwordRecovery(email, token!)
        res.status(204).send("Instruction send to your email")
    }
    async setNewPassword(req: RequestWithBody<NewPasswordRecoveryInputModel>, res: Response) {
        const {newPassword, recoveryCode} = req.body
        const decodedUser = await jwtService.verifyRecoveryToken(recoveryCode)
        if (!decodedUser) {
            res.sendStatus(400)
        }
        const updated = await this.usersService.setNewPassword(decodedUser!, newPassword)
        if (updated) {
            res.sendStatus(204)
            return
        }
        res.sendStatus(400)
    }

}