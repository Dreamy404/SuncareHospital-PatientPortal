import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
    const location=useLocation();
    const {toastMsg}=location.state||{};
    const [password, setPassword] = useState("");
    const { setAuthState, setUser } = useAuth();
    const [username, setUsername] = useState("");
    const [logging, setLogging] = useState(false);
    const toastId = useRef(null);
    const navigate = useNavigate();
    
    useEffect(()=>{
       if(toastMsg){
         toast(toastMsg,{
           type:"info",
           autoClose:1000
         });
       }
    },[]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLogging(true);
        toastId.current = toast.info("Loggin in...");
        try {
            const response = await fetch('/suncarehospital/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();
            console.log(data);

            setAuthState(prevState => ({
                ...prevState,
                isLoggedIn: data.loggedIn,
                accessToken: data.accessToken || prevState.accessToken
            }));

            setUser(data.user || null);

            if (!data.loggedIn) {
                setTimeout(() => {
                    toast.update(toastId.current, {
                        render: data.msg,
                        type: "warning",
                        autoClose: 1500,
                        onClose: () => {
                            setLogging(false);
                        }
                    });
                }, 1000);
            } else {
                toast.dismiss();
                navigate("/");
            }
        } catch (error) {
            setTimeout(() => {
                toast.update(toastId.current, {
                    render: "Oops Sorry!Something Wrong",
                    type: "error",
                    autoClose: 1500,
                    onClose: () => {
                        setLogging(false);
                    }
                });
            }, 1000);
        } 
    }

    return (
        <>
            <div className="container login-container">
                <div className="login">
                    <h3>Login</h3>
                    <form action="/" method="post" onSubmit={handleSubmit} className="login-form">
                        <label htmlFor="username">Enter Username:</label>
                        <input
                            type="text"
                            name="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={logging} className="submit-btn btn">Log In</button>
                    </form>
                    <div className="register-link">
                        <h5>Not Registered?</h5>
                        <a href="/register" className="register-btn btn">Register Now</a>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;