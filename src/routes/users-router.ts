import {Request, Response, Router} from "express";
import {RequestWithBody, RequestWithParams} from "../types";
import {usersService} from "../domain/users-service";
import {UserInputModel} from "../models/User/UserInputModel";
import {ErrorWithValidation} from "../models/Classes/ErrorWithValidation";
import * as validation from "../middlewares/input-validation-middleware";
import {authorisedCheckValidator, InputUserPasswordValidation} from "../middlewares/input-validation-middleware";

export const usersRouter = Router()

usersRouter.get('/',
    authorisedCheckValidator,
    async (req: Request, res: Response) => {
        const result = await usersService.getAllUsers(req.body)
        res.status(200).send(result)
    })

usersRouter.post('/',
    authorisedCheckValidator,
    InputUserPasswordValidation,
    async (req: RequestWithBody<UserInputModel>, res: Response) => {
        try {
            const user = await usersService.createNewUser(req.body);
            res.status(201).json(user);
        } catch (e) {
            if (e instanceof ErrorWithValidation) {
                res.status(400).json({errorsMessages: e.errorsMessages});
                return;
            }
        }
    })

usersRouter.delete('/:id',
    validation.authorisedCheckValidator,
    async (req: RequestWithParams<{ id: string }>, res: Response) => {
        const deletedUser = await usersService.deleteUserById(req.params.id)
        if (deletedUser) {
            res.send(204)
        } else {
            res.send(404)
        }
    })