import {Router} from "express";
import {requestLoggerMiddleware} from "../../middlewares/rate-limit";
import {SecurityDevicesController} from "./security-devices-controller";
import {container} from "../../compositon-root";


export const securityDevicesRouter = Router();

const securityDevicesControllerInstance = container.get(SecurityDevicesController)

securityDevicesRouter.get('/devices',
    requestLoggerMiddleware,
    securityDevicesControllerInstance.getDevices.bind(securityDevicesControllerInstance))

securityDevicesRouter.delete('/devices',
    requestLoggerMiddleware,
    securityDevicesControllerInstance.deleteDevices.bind(securityDevicesControllerInstance))

securityDevicesRouter.delete('/devices/:deviceId',
    requestLoggerMiddleware,
    securityDevicesControllerInstance.deleteDeviceById.bind(securityDevicesControllerInstance))