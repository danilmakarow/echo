import {DocumentReference} from "@angular/fire/compat/firestore";
// Interfaces from DataBase //

export interface UserDB {
    name: string,
    photo: string,
    dialogs: DocumentReference<chat>[]
}

export interface chat {
    message: message[],
    users: DocumentReference<UserDB>[]
}

export interface message {
    time: string,
    content: string,
    senderId: DocumentReference
}
