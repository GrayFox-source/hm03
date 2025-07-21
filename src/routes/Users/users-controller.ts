import {UsersService} from "../../application/users-service";
import {Request, Response} from "express";
import {RequestWithBody, RequestWithParams} from "../../types";
import {UserInputModel} from "../../models/User/UserInputModel";
import {ErrorWithValidation} from "../../models/Classes/ErrorWithValidation";
import {inject, injectable} from "inversify";

@injectable()
export class UsersController {
    constructor(@inject(UsersService)protected usersService: UsersService) {
    }

    async getAllUsers(req: Request, res: Response) {
        const result = await this.usersService.getAllUsers(req.body)
        res.status(200).send(result)
    }

    async createNewUser(req: RequestWithBody<UserInputModel>, res: Response) {
        try {
            const confirmationCode = String(+(new Date()))
            const user = await this.usersService.createNewUser(req.body, confirmationCode);
            res.status(201).json(user);
        } catch (e) {
            if (e instanceof ErrorWithValidation) {
                res.status(400).json({errorsMessages: e.errorsMessages});
                return;
            }
        }
    }

    async deleteUser(req: RequestWithParams<{ id: string }>, res: Response) {
        const deletedUser = await this.usersService.deleteUserById(req.params.id)
        if (deletedUser) {
            res.send(204)
        } else {
            res.send(404)
        }
    }
}