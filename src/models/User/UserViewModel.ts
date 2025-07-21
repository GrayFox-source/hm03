export type UserViewModel = {
    id: string,
    login: string,
    email: string,
    createdAt: string
}

export class UserDBModel {
    constructor(public id: string,
                public login: string,
                public email: string,
                public passwordHash: string,
                public createdAt: string,
                public emailConfirmation: {
                    confirmationCode: string,
                    expirationDate: Date,
                    isConfirmed: boolean,
                },)
    {}
    canBeConfirmed(code: string): boolean {
        return this.emailConfirmation.confirmationCode === code &&
            this.emailConfirmation.expirationDate >= new Date();
    }
    confirm(): void {
        if (this.emailConfirmation.isConfirmed) throw new Error('This user is already confirmed')
        this.emailConfirmation.isConfirmed = true
    }
}


// export type UserDBModel = {
//     id: string;
//     login: string;
//     email: string;
//     passwordHash: string;
//     createdAt: string;
//     emailConfirmation: {
//         confirmationCode: string,
//         expirationDate: Date,
//         isConfirmed: boolean,
//     },
// };