import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);


const ACCESS_TOKEN_RENEW_INTERVAL = 12 * 60 * 1000;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authState, setAuthState] = useState({ isLoggedIn: false, accessToken: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const tryLoggingIn = async () => {
            console.log("In try Loggin in");
            try {
                const response = await fetch('/suncarehospital/auth/newaccesstoken', { method: "POST" });

                const data = await response.json();

                console.log(data);

                if (data.loggedIn) {
                    setAuthState(prevState => ({
                        ...prevState,
                        isLoggedIn: data.loggedIn,
                        accessToken: data.accessToken || prevState.accessToken
                    }));
                    setUser(data.user || null);
                    //toast.success("Logged In!",{autoClose:1000});
                }


            } catch (error) {
                console.error(error);

            } finally {
                setLoading(false);
                console.log("Set loading false");
            }


        }

        tryLoggingIn();
    }, []);

    useEffect(() => {
        if (authState.isLoggedIn) {
            const intervalId = setInterval(async () => {
                try {
                    const response = await fetch('/suncarehospital/auth/newaccesstoken', { method: "POST" });

                    const data = await response.json();

                    if (data.loggedIn) {
                        setAuthState(prevState => ({
                            ...prevState,
                            isLoggedIn: data.loggedIn,
                            accessToken: data.accessToken || prevState.accessToken
                        }));
                        setUser(data.user || null);
                    }
                } catch (error) {
                    console.error(error);
                }
            }, ACCESS_TOKEN_RENEW_INTERVAL);

            return () => clearInterval(intervalId);
        }

    }, [authState.isLoggedIn]);

    const authValue = useMemo(() => ({ user, setUser, authState, setAuthState, loading }), [user, authState,loading]);

    return (
        <AuthContext.Provider value={authValue}>
            {children}
        </AuthContext.Provider>
    )
};
