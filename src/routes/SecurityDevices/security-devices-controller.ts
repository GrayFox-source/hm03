import {JwtService} from "../../application/jwt/jwtService";
import {DevicesService} from "../../domain/devices-service";
import {Request, Response} from "express";
import {JwtPayload} from "jsonwebtoken";
import {inject, injectable} from "inversify";

@injectable()
export class SecurityDevicesController {
    constructor(
        @inject(JwtService)
        private jwtService: JwtService,
        @inject(DevicesService)
        private devicesService: DevicesService) {
    }

    async getDevices(req: Request, res: Response) {
        const token = req.cookies.refreshToken
        const payload = await this.jwtService.verifyUser(token.refreshToken) as JwtPayload
        try {
            const refreshTokenRecord = await this.jwtService.refreshTokenRecord(token.refreshToken, payload.userId)
            if (refreshTokenRecord === null) {
                res.sendStatus(401);
                return
            }
            if (!payload) {
                res.sendStatus(401)
                return
            } else {
                const devices = await this.devicesService.findDevices(payload.userId)
                res.status(200).send(devices)
            }
        } catch (e) {
            console.error(e)
            res.sendStatus(401)
        }
    }

    async deleteDevices(req: Request, res: Response) {
        const token = req.cookies.refreshToken
        const payload = await this.jwtService.verifyUser(token.refreshToken) as JwtPayload
        try {
            const refreshTokenRecord = await this.jwtService.refreshTokenRecord(token.refreshToken, payload.userId)
            console.log(payload)
            if (refreshTokenRecord === null) {
                console.log("refrehTokenRecord")
                res.sendStatus(401);
                return
            }
            if (!payload) {
                console.log('Payload')
                res.sendStatus(401)
                return
            }
            const clearSessions = await this.devicesService.deleteDevices({
                userId: payload.userId,
                deviceId: payload.deviceId
            })
            if (clearSessions) {
                res.sendStatus(204)
            } else {
                res.status(401).send("Unauthorized")
            }
        } catch (e) {
            console.error(e)
            res.sendStatus(401)
        }
    }

    async deleteDeviceById(req: Request, res: Response) {
        const deviceId = req.params.deviceId
        const token = req.cookies.refreshToken
        const payload = await this.jwtService.verifyUser(token.refreshToken) as JwtPayload
        try {
            const refreshTokenRecord = await this.jwtService.refreshTokenRecord(token.refreshToken, payload.userId)
            if (refreshTokenRecord === null) {
                res.sendStatus(401);
                return
            }
            if (!payload) {
                res.sendStatus(401)
                return
            }
            const clearSessions = await this.devicesService.deleteDeviceById(deviceId)
            if (clearSessions) {
                res.sendStatus(204)
            } else {
                res.status(404).send("Not Found")
            }
        } catch (e) {
            console.error(e)
            res.sendStatus(401)
        }
    }
}