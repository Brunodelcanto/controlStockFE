import { onAuthStateChanged } from "firebase/auth";
import React, { useContext, useEffect, useState } from "react";
import { auth } from "../../firebase/firebase";

interface UserData {
    name:string;
    email: string;
}

interface AuthData {
    currentUser: UserData | null;
    userLoggedIn: boolean;
    loading: boolean;
}



const AuthContext = React.createContext<AuthData | null>(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe;
    }, []);

    const initializeUser = async (user: any) => {
        if (user) {
            setCurrentUser(user);
            setUserLoggedIn(true);
        } else {
            setCurrentUser(null);
            setUserLoggedIn(false);
        }
        setLoading(false);
    };

    const value = {
        currentUser,
        userLoggedIn,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh',
                    backgroundColor: '#1D1D27',
                    color: '#cca281'
                }}>
                    <div>Loading...</div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );

};