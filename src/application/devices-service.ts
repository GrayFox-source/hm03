import {DeviceDBModel, DeviceViewModel} from "../models/Auth/DeviceModel";
import {DevicesRepository} from "../infrastucture/devices-repository";
import {inject, injectable} from "inversify";


@injectable()
export class DevicesService  {
    constructor(@inject(DevicesRepository) private devicesRepository: DevicesRepository) {
    }
    async insertDevice(device: DeviceDBModel): Promise<boolean> {
        return await this.devicesRepository.insertDevice(device)
    }
    async findDevices(userId: string): Promise<DeviceViewModel[]> {
        const devices = await this.devicesRepository.findDevices(userId)
        return devices.map(device => ({
            ip: device.ip,
            title: device.title,
            lastActivateDate: device.lastActivateDate,
            deviceId: device.deviceId,
        }));
    }
    async deleteDevices(deviceDTO: {userId: string, deviceId: string}) {
        return await this.devicesRepository.deleteDevices(deviceDTO)
    }
    async deleteDeviceById(deviceId: string): Promise<boolean> {
        return await this.devicesRepository.deleteDeviceById(deviceId)
    }
    async updateActiveTimeOfSession(deviceId: string): Promise<boolean> {
        return await this.devicesRepository.updateActiveTimeOfSession(deviceId)
    }
}

