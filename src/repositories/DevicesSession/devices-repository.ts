import {devicesCollection} from "../db";
import {DeviceDBModel, DeviceViewModel} from "../../models/Auth/DeviceModel";

export const devicesRepository = {
    async insertDevice(device: DeviceDBModel): Promise<boolean> {
        const insertion = await devicesCollection.insertOne(device)
        if (!insertion) {
            return false
        }
        return true
    },
    async findDevices(userId: string): Promise<DeviceViewModel[]> {
        return await devicesCollection
            .find({ userId })
            .toArray();
    },
    async deleteDevices(deviceDTO: {userId: string, deviceId: string}): Promise<boolean> {
        const deleted = await devicesCollection.deleteMany({userId: deviceDTO.userId,
        deviceId: {$ne: deviceDTO.deviceId}
        })
        if (deleted.deletedCount > 0) {
            return true
        }
        return false
    },

    async deleteDeviceById(deviceId: string): Promise<boolean> {
        const deleted = await devicesCollection.deleteOne({deviceId: deviceId})
        return deleted.deletedCount === 1
    },

    async updateActiveTimeOfSession(deviceId: string): Promise<boolean> {
        const updates = await devicesCollection.updateOne({deviceId: deviceId}, {$set: {lastActivateDate: String(new Date())}});
        return updates.modifiedCount === 1
    }
}