import React from "react";
import { Link } from "react-router-dom";

const DoctorCard = ({ doctor }) => {

    console.log(doctor);
    return (
        <>

            <div className="container card">
                <Link to={`/doctors/${doctor.id}`} state={{doctor}} className="card-link">
                    <div className="image-card">
                        <img src={doctor.image||"/doctordefault.jpeg"} onError={(e)=>{
                            e.target.onerror=null;
                            e.target.src="/doctordefault.jpeg";
                        }} alt={doctor.name} className="doctor-image" />
                    </div>
                    <div className="info-card">
                        <h4 className="name">{doctor.name}</h4>
                        <p className="degree">
                            {doctor.degrees.map(({ degree, subject }) => `${degree}(${subject})`).join(',')}
                        </p>
                        <div className="workday">
                            <h5>Workdays:</h5>
                            {doctor.practicedays.map(({ day, start,end }, index) => (<span key={index} className="workday-item">{day}:{start}-{end}</span>))}
                        </div>
                    </div>
                </Link>
            </div>
        </>
    );
}

export default DoctorCard;