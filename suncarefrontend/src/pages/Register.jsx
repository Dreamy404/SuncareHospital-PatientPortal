import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context";
import { useNavigate } from "react-router-dom";


const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
];

const Register = () => {
    const [year, setYear] = useState("");
    const [password, setPassword] = useState("");
    const [years, setYears] = useState([]);
    const [month, setMonth] = useState(1);
    const [days, setDays] = useState([]);
    const [selectedDay, setSelectedDay] = useState("1");
    const [confirmPasssword, setConfirmPassword] = useState("");
    const toastId = useRef(null);
    const { setAuthState, setUser } = useAuth();
    const [registering, setRegistering] = useState(false);
    const navigate = useNavigate();

    const loadYears = () => {
        let arr = [];
        let year = new Date().getFullYear();
        const yearSpan = year - 100;

        while (year > yearSpan) {
            arr.push(`${year}`);
            year--;
        }

        return arr;
    }

    useEffect(() => {
        setYears(loadYears());
        setYear(new Date().getFullYear());
        setMonth(new Date().getMonth() + 1);
        setSelectedDay(new Date().getDate());
    }, []);

    useEffect(() => {
        const getDaysInMonth = (year, month) => {
            return new Date(year, month, 0).getDate();
        }

        const dyasInMonth = getDaysInMonth(year, month);
        const newDays = Array.from({ length: dyasInMonth }, (_, i) => i + 1);

        setDays(newDays);
    }, [year, month]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        //console.log("Hello");
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        setRegistering(true);

        if (password === confirmPasssword) {
            toastId.current = toast.info("Registering...");
            const response = await fetch('/suncarehospital/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const responseData = await response.json();

            if (response.ok) {
                setTimeout(() => {
                    toast.update(toastId.current, {
                        render: "Succesfully Registered",
                        type: "success",
                        autoClose: 500,
                        onClose: () => {
                            navigate("/");
                        }
                    });
                }, 1000);

                setAuthState(prevState => {
                    return {
                        ...prevState,
                        isLoggedIn: responseData.loggedIn,
                        accessToken: responseData.accessToken || prevState.accessToken
                    }
                });

                setUser(responseData.user || null);
            } else {
                setTimeout(() => {
                    toast.update(toastId.current, {
                        render: responseData?.msg ?? "Something Wrong Happened",
                        type: "error",
                        autoClose: 1500,
                        onClose: () => {
                            setRegistering(false);
                        }
                    });
                }, 1000);
            }

        } else {
            toast("Both Password Must match");
            setRegistering(false);
        }
    }

    return (
        <>
            <main className="register-page">
                <div className="container">
                    <div className="patient-register">
                        <form onSubmit={handleSubmit} className="register-form">
                            <h3 className="main-title">Register</h3>

                            <div className="patient-info">
                                <h4 className="section-title">Your Info (Mandatory)</h4>
                                <div className="patient-grid">
                                    <div className="grid-child">
                                        <label htmlFor="name" className="label">Name:</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="apt-field"
                                            required
                                        />
                                    </div>

                                    <div className="birth-date-container">
                                        <label htmlFor="age" className="label">Birth Date:</label>
                                        <div className="date-input-group">
                                            <input
                                                list="year"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                name="year"
                                                className="apt-field"
                                                placeholder="Year"
                                                value={year}
                                                onChange={(e) => {
                                                    const currDate = new Date();
                                                    const currMonth = currDate.getMonth();
                                                    const currYear = currDate.getFullYear();

                                                    if (e.target.value == currYear) {
                                                        if (month > currMonth) {
                                                            setMonth("1");
                                                        }
                                                    }

                                                    setYear(e.target.value);
                                                }}
                                                onBlur={() => {
                                                    if (!years.includes(year)) {
                                                        alert("Please select a valid option from the list!");
                                                        setYear("");
                                                    }
                                                }}
                                                required
                                            />
                                            <datalist id="year">
                                                {years.map(yr => (<option value={yr} key={yr} />))}
                                            </datalist>

                                            <select
                                                name="month"
                                                id="month"
                                                value={month}
                                                className="apt-dropdown"
                                                onChange={(e) => {
                                                    const currDate = new Date();
                                                    const currMonth = currDate.getMonth();
                                                    const currYear = currDate.getFullYear();
                                                    
                                                    if (year == currYear) {
                                                        if (e.target.value > currMonth + 1) {
                                                            toast.warning("Please Enter A Valid Birthdate!", {
                                                                autoClose: 500
                                                            });
                                                            setMonth(1);


                                                            return;
                                                        }
                                                    }
                                                    setMonth(e.target.value);
                                                }}
                                                required
                                            >
                                                {months.map((month, index) => (<option key={index + 1} value={index + 1}>{month}</option>))}
                                            </select>

                                            <select
                                                name="day"
                                                id="day"
                                                className="apt-dropdown"
                                                value={selectedDay}
                                                onChange={(e) => {
                                                    const currDate = new Date();
                                                    const currMonth = currDate.getMonth() + 1;
                                                    const currYear = currDate.getFullYear();
                                                    const nowDate = currDate.getDate();

                                                    if (year == currYear && month == currMonth) {
                                                        if (e.target.value >= nowDate) {
                                                            toast.warning("Please Enter A Valid Birthdate!", {
                                                                autoClose: 500
                                                            });
                                                            setSelectedDay("1");
                                                            return;
                                                        }
                                                    }
                                                    setSelectedDay(e.target.value);
                                                }}
                                                required
                                            >
                                                {days.map((day) => (<option value={day} key={day}>{day}</option>))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="gender-radio-grp">
                                        <label htmlFor="gender" className="label">Gender:</label>
                                        <div className="radio-group">
                                            <label className="radio-label">
                                                <input type="radio" name="gender" value="1" className="radio-input" required /> Male
                                            </label>
                                            <label className="radio-label">
                                                <input type="radio" name="gender" value="2" className="radio-input" /> Female
                                            </label>
                                            <label className="radio-label">
                                                <input type="radio" name="gender" value="3" className="radio-input" /> Others
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h4 className="section-title">Contact Info (Optional)</h4>
                            <div className="contact-info">
                                <label htmlFor="phone" className="label">Phone:</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="apt-field"
                                    pattern="^01[3-9]\d{8}$"
                                    placeholder="01234567890"
                                    title="Must be a valid Bangladeshi number (e.g., 01812345678)"
                                />

                                <label htmlFor="email" className="label">Enter Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="apt-field"
                                    placeholder="youremail123@gmail.com"
                                    pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                                />

                                <label htmlFor="address" className="label">Address:</label>
                                <input
                                    type="text"
                                    name="address"
                                    className="apt-field"
                                    placeholder="Your Address"
                                />
                            </div>

                            <h4 className="section-title">Account Info (Mandatory)</h4>
                            <div className="account-info">
                                <label htmlFor="username" className="label">Username:</label>
                                <input
                                    type="text"
                                    name="username"
                                    className="apt-field"
                                    required
                                />

                                <label htmlFor="password" className="label">Password:</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="apt-field"
                                    pattern="^.{6,18}$"
                                    placeholder="Password of length 6-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                <label htmlFor="confirmpassword" className="label">Confirm Password:</label>
                                <input
                                    type="password"
                                    name="confirmpassword"
                                    className="apt-field"
                                    pattern="^.{6,18}$"
                                    placeholder="Confirm the given Password"
                                    value={confirmPasssword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={registering}
                                className="reigster-btn"
                            >
                                {registering ? 'Registering...' : 'Register'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}

export default Register;