import React from "react";
import { Link } from "react-router-dom";


const Footer = () => {
    return (
        <>
            <footer className="footer">
                <div className="container">
                    <div className="contact-us">
                        <p>Contact Us:</p>
                        <div className="socials">
                            <ul className="social-list">
                                <li className="social-item">
                                    <a href="/"><i class="fa-brands fa-facebook"></i></a>
                                </li>
                                <li className="social-item">
                                    <a href="/"><i class="fa-brands fa-whatsapp"></i></a>
                                </li>
                                <li className="social-item">
                                    <a href="/"><i class="fa-brands fa-linkedin"></i></a>
                                </li>
                                <li className="social-item">
                                    <a href="/"><i class="fa-brands fa-square-twitter"></i></a>
                                </li>
                            </ul>
                        </div>
                    </div>
                     <div className="bar"></div>
                    <div className="copyright">
                        <Link to="/" >&copy; All rights reserved by<span className="copyright-name"> Suncare Hospital</span> </Link>
                    </div>
                </div>
            </footer>
        </>
    );
}

export default Footer;