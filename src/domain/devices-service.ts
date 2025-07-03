import {DeviceDBModel, DeviceViewModel} from "../models/Auth/DeviceModel";
import {devicesRepository} from "../repositories/DevicesSession/devices-repository";

export const devicesService = {
    async insertDevice(device: DeviceDBModel): Promise<boolean> {
        return await devicesRepository.insertDevice(device)
    },
    async findDevices(userId: string): Promise<DeviceViewModel[]> {
        const devices = await devicesRepository.findDevices(userId)
        return devices.map(device => ({
            ip: device.ip,
            title: device.title,
            lastActivateDate: device.lastActivateDate,
            deviceId: device.deviceId,
        }));
    },
    async deleteDevices(deviceDTO: {userId: string, deviceId: string}) {
        return await devicesRepository.deleteDevices(deviceDTO)
    },
    async deleteDeviceById(deviceId: string): Promise<boolean> {
        return await devicesRepository.deleteDeviceById(deviceId)
    },
    async updateActiveTimeOfSession(deviceId: string): Promise<boolean> {
        return await devicesRepository.updateActiveTimeOfSession(deviceId)
    },
}