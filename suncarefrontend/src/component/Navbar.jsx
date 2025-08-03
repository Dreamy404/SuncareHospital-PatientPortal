import React, { useRef, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context";
import { toast } from "react-toastify";

const Navbar = () => {
  const { authState, setAuthState, setUser } = useAuth();
  const navigate = useNavigate();
  const toastId = useRef(null);

  const showToast = (message, type = "info", autoClose = 1000, onClose = () => { }) => {
    if (toast.isActive(toastId.current)) {
      toast.update(toastId.current, {
        render: message,
        type: type,
        autoClose: autoClose,
        onClose: onClose
      });
    } else {
      toastId.current = toast(message, {
        type: type,
        autoClose: autoClose,
        onClose: onClose
      });
    }
  }

  const handleLogin = async () => {
    if (authState.isLoggedIn) {
      //logout-btn
      showToast("Loggin Out...", "loading", 1000);
      try {
        const response = await fetch('/suncarehospital/auth/logout', {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${authState.accessToken}`
          },
          credentials: 'include'
        });

        if (response.ok) {
          setAuthState(prevState => {
            return {
              ...prevState,
              isLoggedIn: false,
              accessToken: ""
            }
          });

          setUser(null);

          showToast("Logged Out!", "success", 500, () => {
            navigate("/");
          });
        } else {
          const data = await response.json();
          showToast(data?.msg || "Error Occured!Try Later.", "warning", 1000);
        }

      } catch (error) {
        showToast("Network Error!Try Later", "warning", 1000);
      }

    } else {
      //log-in btn
      navigate("/login");
    }
  }

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <ul className="menu-box">
            <li>
              <NavLink className="navbar-link" to="/"><img src="/bacgroundless.png" height={40} width={55} alt="" /></NavLink>
            </li>
          </ul>
          <ul className="menu-box">
            <li>
              <Link className="menu-item" to="/"><i className="fa-solid fa-house"></i>Home</Link>
            </li>
            <li>
              <Link className="menu-item" to="/doctors"> <i class="fa-solid fa-user-doctor"></i>Doctors</Link>
            </li>
            <li>
              <Link className="menu-item" to="/patient"> <i class="fa-solid fa-hospital-user"></i>Patient</Link>
            </li>
            <li>
              <Link className="menu-item" to="/services"><i class="fa-solid fa-stethoscope"></i>Services</Link>
            </li>
            <li>
              <Link className="menu-item" to="/"><i class="fa-solid fa-square-phone"></i>Contact</Link>
            </li>
            <li>
              <button className={authState.isLoggedIn ? "logout-btn btn" : "login-btn btn"} onClick={handleLogin} > {authState.isLoggedIn ? "Log out" : "Log in"}</button>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}

export default Navbar;