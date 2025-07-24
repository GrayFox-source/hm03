import {UsersRepository} from "./infrastucture/users-repository";
import {UsersService} from "./application/users-service";
import {UsersController} from "./routes/Users/users-controller";
import {Container} from "inversify";
import {AuthService} from "./application/auth-service";

import {AuthController} from "./routes/Auth/auth-controller";
import {JwtRepository} from "./infrastucture/jwt-repository";
import {JwtService} from "./application/jwtService";

import {SecurityDevicesController} from "./routes/SecurityDevices/security-devices-controller";
import {DevicesService} from "./application/devices-service";
import {DevicesRepository} from "./infrastucture/devices-repository";
import {CommentsRepository} from "./infrastucture/comments-repository";
import {CommentsService} from "./application/comments-service";
import {CommentsController} from "./routes/Comments/comments-controller";


// const objects: any[] = []
//
// const usersRepository = new UsersRepository()
// objects.push(usersRepository)
//
// const usersService = new UsersService(usersRepository)
// objects.push(usersService)
//
// const userController = new UsersController(usersService)
// objects.push(userController)
//
// export const ioc = {
//     getInstance<T>(ClassType: any) {
//         const TargetInstance = objects.find(o => o instanceof ClassType)
//         return TargetInstance as T
//     }
// }
//
// export const authService = new AuthService(usersService)

export const container = new Container()
container.bind<UsersController>(UsersController).toSelf()
container.bind<UsersRepository>(UsersRepository).toSelf()
container.bind<UsersService>(UsersService).toSelf()
container.bind<AuthService>(AuthService).toSelf()
container.bind<AuthController>(AuthController).toSelf()
container.bind<JwtRepository>(JwtRepository).toSelf()
container.bind<JwtService>(JwtService).toSelf()
container.bind<SecurityDevicesController>(SecurityDevicesController).toSelf()
container.bind<DevicesService>(DevicesService).toSelf()
container.bind<DevicesRepository>(DevicesRepository).toSelf()
container.bind<CommentsRepository>(CommentsRepository).toSelf()
container.bind<CommentsService>(CommentsService).toSelf()
container.bind<CommentsController>(CommentsController).toSelf()

export const jwtService = container.get(JwtService)



