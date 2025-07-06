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
                },) {
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