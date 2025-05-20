export class ErrorWithValidation extends Error {
    constructor(public errorsMessages: Array<{ field: string; message: string }>) {
        super('Validation failed');
    }
}