import {body, FieldValidationError, validationResult} from 'express-validator'
import {NextFunction, Request, Response} from "express";

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
