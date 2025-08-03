import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
    Navbar,
    Footer
} from '../component';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";


const Doctor = () => {
    const { state } = useLocation();
    const { id } = useParams();
    const [doctor, setDoctor] = useState(state?.doctor || null);
    const navigate = useNavigate();

    useEffect(() => {
        const getDoctor = async () => {
            try {
                const response = await fetch(`http://localhost:5000/suncarehospital/doctors/${id}`);

                if (!response.ok) {
                    navigate('not-found', { replace: true });
                }
                const data = await response.json();

                setDoctor(data);
            } catch (error) {
                navigate('not-found', { replace: true });
            }
        }

        if (!doctor) {
            getDoctor();
        }
    }, [doctor, id]);

    const bookAppointment = () => {
        navigate('/appointment', { state: { doctor } });
    }

    const DocLoading = () => {
        return (
            <main className="details-container">
                <div className="container">
                    <div className="skeleton-container">
                        <div className="skeleton-img-container">
                            <Skeleton height={320} width={280} borderRadius={12} />
                            <Skeleton height={40} width={200} borderRadius={10} />
                        </div>
                        <div className="skeleton-info-container">
                            <div className="skeleton-degrees">
                                <Skeleton height={60} width="100%" borderRadius={8} />
                                <Skeleton height={60} width="90%" borderRadius={8} />
                                <Skeleton height={60} width="95%" borderRadius={8} />
                            </div>
                            <Skeleton height={2} width="100%" />
                            <div className="skeleton-practice">
                                <Skeleton height={60} width="100%" borderRadius={8} />
                                <Skeleton height={60} width="85%" borderRadius={8} />
                                <Skeleton height={60} width="92%" borderRadius={8} />
                            </div>
                        </div>
                    </div>
                    <Skeleton height={60} width={300} borderRadius={8} style={{ margin: '0 auto', display: 'block' }} />
                </div>
            </main>
        );
    }

    const SingleDoctor = () => {
        return (
            <main className="details-container">
                <div className="doctor-container">
                    <div className="doctor-details-container">
                        <div className="img-name-container">
                            <div className="doc-img">
                                <img src={doctor.image||"/doctordefault.jpeg"} className="details-doctor-img" alt={doctor.name} />
                            </div>
                            <div className="name">
                                <p>{doctor.name}</p>
                            </div>
                        </div>
                        <div className="info-container">
                            <ul className="det-degrees">
                                {doctor.degrees.map(deg => (
                                    <li key={deg.degree}>
                                        {`${deg.degree}(${deg.subject}), ${deg.institute}`}
                                    </li>
                                ))}
                            </ul>
                            <hr />
                            <ul className="det-practicedays">
                                {doctor.practicedays.map(element => (
                                    <li key={element.day}>
                                        {`${element.day}: ${element.start} - ${element.end}`}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <button className="appt-btn btn" onClick={bookAppointment}>
                        Book Appointment
                    </button>
                </div>
            </main>
        );
    }

    return (
        <>
            <Navbar />
            {doctor ? <SingleDoctor /> : <DocLoading />}
            <Footer />
        </>
    )
}

export default Doctor;