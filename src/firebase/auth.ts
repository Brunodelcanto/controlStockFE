import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebase";

export const createUser = async (email:string, password: string) => 
    createUserWithEmailAndPassword(auth, email, password);

export const signIn = async (email:string, password: string) => 
    signInWithEmailAndPassword(auth, email, password);

export const logOut = auth.signOut();