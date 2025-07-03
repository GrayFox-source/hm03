import {Router} from "express";
import {JwtPayload} from "jsonwebtoken";
import {jwtService} from "../../application/jwt/jwtService";
import {devicesService} from "../../domain/devices-service";
import {requestLoggerMiddleware} from "../../middlewares/rate-limit";

export const securityDevicesRouter = Router();

securityDevicesRouter.get('/devices',
    requestLoggerMiddleware,
    async (req, res) =>  {
    const token = req.cookies.refreshToken
    const payload = await jwtService.verifyUser(token.refreshToken) as JwtPayload
    try {
        const refreshTokenRecord = await jwtService.refreshTokenRecord(token.refreshToken, payload.userId)
        if (refreshTokenRecord === null) {
            res.sendStatus(401);
            return
        }
        if (!payload) {
            res.sendStatus(401)
            return
        } else {
            const devices = await devicesService.findDevices(payload.userId)
            res.status(200).send(devices)
        }
    } catch (e) {
        console.error(e)
        res.sendStatus(401)
    }
})

securityDevicesRouter.delete('/devices',
    requestLoggerMiddleware,
    async (req, res) => {
    const token = req.cookies.refreshToken
    const payload = await jwtService.verifyUser(token.refreshToken) as JwtPayload
    try {
        const refreshTokenRecord = await jwtService.refreshTokenRecord(token.refreshToken, payload.userId)
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
        const clearSessions = await devicesService.deleteDevices({userId: payload.userId, deviceId: payload.deviceId})
        if (clearSessions) {
            res.sendStatus(204)
        } else {
            res.status(401).send("Unauthorized")
        }
    } catch (e) {
        console.error(e)
        res.sendStatus(401)
    }
})

securityDevicesRouter.delete('/devices/:deviceId',
    requestLoggerMiddleware,
    async (req, res) => {
    const deviceId = req.params.deviceId
    const token = req.cookies.refreshToken
    const payload = await jwtService.verifyUser(token.refreshToken) as JwtPayload
    try {
        const refreshTokenRecord = await jwtService.refreshTokenRecord(token.refreshToken, payload.userId)
        if (refreshTokenRecord === null) {
            res.sendStatus(401);
            return
        }
        if (!payload) {
            res.sendStatus(401)
            return
        }
        const clearSessions = await devicesService.deleteDeviceById(deviceId)
        if (clearSessions) {
            res.sendStatus(204)
        } else {
            res.status(404).send("Not Found")
        }
    } catch (e) {
        console.error(e)
        res.sendStatus(401)
    }
})