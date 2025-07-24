import {body, FieldValidationError, validationResult} from 'express-validator'
import {NextFunction, Request, Response} from "express";
import {UsersService} from "../application/users-service";
import "reflect-metadata"
import {container, jwtService} from "../compositon-root";

const usersService = container.get(UsersService)


export const inputValidationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array({onlyFirstError: true}).map((error) => {
            const typedError = error as unknown as FieldValidationError
            return {
                message: typedError.msg,
                field: typedError.path
            }
        });
        res.status(400).json({ errorsMessages: formattedErrors });
    } else {
        next();
    }
};

export const authorisedCheckValidator = (req: Request, res: Response, next: NextFunction): void => {
    const authHead = req.headers.authorization;
    if (!authHead) {
        res.status(401).send();
    } else {
        const [scheme, encoded] = authHead.split(" ");
        if (scheme !== "Basic" || !encoded) {
            res.status(401).send();
        }
        const decoded = Buffer.from(encoded, 'base64').toString('utf8');
        const [username, password] = decoded.split(":");
        if (username === "admin" && password === "qwerty") {
            return next();
        } else {
            res.status(401).send();
        }
    }
};



export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        res.sendStatus(401)
        return
    }
    const token = req.headers.authorization.split(' ')[1]
    const userId = await jwtService.getIdUserByToken(token)
    if (userId) {
        req.user = await usersService.findUserById((userId).toString())
        next()
        return
    }
    res.sendStatus(401)
};


export const inputNameBlogValidation = body('name').trim().isLength({
    min: 1,
    max: 15
}).withMessage('Name must be from 1 to 15')
export const inputDescriptionValidation = body('description').trim().isLength({
    min: 1,
    max: 500
}).withMessage('Description must be from 1 to 500')
export const InputURLValidation = body('websiteUrl').trim().isURL().withMessage('Invalid URL').isLength({
    min: 1,
    max: 100
}).withMessage('WebsiteURL must be URL and from 1 to 100')

export const InputPostTitleValidation = body('title').trim().isLength({
    min: 1,
    max: 30
}).withMessage('Title must be between 1 to 30')
export const InputPostShortDescriptionValidation = body('shortDescription').trim().isLength({
    min: 1,
    max: 100
}).withMessage('Description must be between 1 and 100')
export const InputPostContentValidation = body('content').trim().isLength({
    min: 1,
    max: 100
}).withMessage('Content must be between 1 and 1000')
export const InputPostBlogIDValidation = body('blogId').isString().withMessage('BlogID must be string')

export const InputUserPasswordValidation = body('password').isLength({min: 6, max: 20}).withMessage('Invalid password')

export const CommentContentInputValidation = body('content').isLength({
    min: 20,
    max: 300
}).withMessage('Invalid content for comment')

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

export const validateEmailFormat = (req: Request, res: Response, next: NextFunction) => {
    const email = req.body.email;

    if (!email) {
        res.status(400).send({
            error: 'Email is required',
        });
        return
    }

    if (!emailRegex.test(email)) {
        res.status(400).send({
            error: 'Email format is invalid',
        });
        return
    }

    next();
};

const validLikeStatuses = ['None', 'Like', 'Dislike'] as const;
type LikeStatus = typeof validLikeStatuses[number];

function isLikeStatus(value: any): value is LikeStatus {
    return validLikeStatuses.includes(value);
}

export async function handleLikeStatus(req: Request, res: Response, next: NextFunction) {
    const { likeStatus } = req.body;

    if (!isLikeStatus(likeStatus)) {
        res.status(400).send({ message: 'Invalid likeStatus', field: "likeStatus" });
        return
    }
    next()
    // дальше безопасно используем likeStatus
}
