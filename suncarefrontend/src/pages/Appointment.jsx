import React, { useEffect, useRef, useState } from "react";
import { Navbar, Footer } from "../component";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context";
import { toast } from "react-toastify";




const Appointment = () => {
    const { state } = useLocation();
    const { user, authState } = useAuth();
    const [doctors, setDoctors] = useState([]);
    const [docId, setDocId] = useState(state?.doctor?.id || "");
    const [docAvailable, setDocAvailable] = useState([]);
    const [date, setDate] = useState("");
    const [weekDay, setWeekDay] = useState("");
    const [time, setTime] = useState("");
    const [times, setTimes] = useState([]);
    const [booking, setBooking] = useState(false);
    const toastId = useRef(null);
    const [appointments, setAppointments] = useState([]);
    const [newAppt, setNewAppt] = useState(true);

    // Modal states
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});

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

    useEffect(() => {
        const getDoctors = async () => {
            try {
                const response = await fetch('/suncarehospital/options/doctors', { method: 'GET' });

                const data = await response.json();

                setDoctors(data);
            } catch (error) {

            }
        }

        getDoctors();
    }, []);

    useEffect(() => {
        setDate("");
        setWeekDay("");

        const getDateSchedule = async () => {
            try {
                const response = await fetch(`/suncarehospital/doctors/nextschedule?doctorId=${docId}`, { method: 'GET' });

                const data = await response.json();

                setDocAvailable(data);
            } catch (error) {

            }
        }

        if (docId !== "") getDateSchedule();
    }, [docId]);

    useEffect(() => {
        setTime("");

        const getTimeSchedule = async () => {
            try {
                const response = await fetch(`/suncarehospital/doctors/timeschedule?doctorId=${docId}&week_day=${weekDay}`, { method: 'GET' });

                const data = await response.json();

                setTimes(data);
            } catch (error) {

            }
        }

        if (weekDay !== "") getTimeSchedule();
    }, [weekDay]);


    useEffect(() => {
        const getAppointments = async () => {
            try {
                const response = await fetch(`/suncarehospital/appointment/appointments`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authState.accessToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setAppointments(data?.appointments || []);
                }
            } catch (error) {

            }
        }
        if (newAppt) {
            getAppointments();
            setNewAppt(false);
        }
    }, [newAppt]);


    const handleSubmit = async (event) => {
        event.preventDefault();
        setBooking(true);

        showToast("Booking...", "loading", 1000);

        // console.log(docId,time,date,weekDay);
        const [start, end] = time.split("-");
        //console.log(start,end);
        try {
            const response = await fetch("/suncarehospital/appointment/book", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authState.accessToken}`
                },
                body: JSON.stringify({
                    patientId: user.patient_id,
                    doctorId: docId,
                    date: date,
                    start: start,
                    end: end
                })
            });

            if (response.ok) {
                showToast("Booked The Appointed!", "success", 1000, () => {
                    setNewAppt(true);
                    setBooking(false);
                });
            } else {
                const data = await response.json();
                showToast(data?.msg || "Please Try Later!", "warning", 1000, () => {
                    setBooking(false);
                });
            }
        } catch (error) {
            showToast("Network Error!Try Later!", "warning", 1000, () => {
                setBooking(false);
            });
        }
    }

    const handleAppointmentClick = (appointment) => {
        setSelectedAppointment(appointment);
        setEditData({
            doctorId: "",
            date: "",
            time: ""
        });
        setIsModalOpen(true);
        setIsEditing(false);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedAppointment(null);
        setIsEditing(false);
        setEditData({});
    };

    const handleCancelAppointment = async () => {
        if (!selectedAppointment?.id) return;

        showToast("Cancelling appointment...", "loading");

        try {
            const response = await fetch(`/suncarehospital/appointment/cancel/${selectedAppointment.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authState.accessToken}`
                }
            });

            if (response.ok) {
                showToast("Appointment cancelled successfully!", "success", 2000);
                setNewAppt(true);
                closeModal();
            } else {
                const data = await response.json();
                showToast(data?.msg || "Failed to cancel appointment", "error");
            }
        } catch (error) {
            showToast("Network error! Please try again.", "error");
        }
    };

    const handleEditAppointment = async () => {
        console.log('In Save eidt changes!');
        console.log(selectedAppointment.id);
        if (!selectedAppointment?.id) return;

        const [start, end] = editData.time.split("-");
        showToast("Updating appointment...", "loading");

        try {
            const response = await fetch(`/suncarehospital/appointment/update/${selectedAppointment.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authState.accessToken}`
                },
                body: JSON.stringify({
                    doctorId: editData.doctorId,
                    date: editData.date,
                    start: start,
                    end: end
                })
            });

            if (response.ok) {
                showToast("Appointment updated successfully!", "success", 2000);
                setNewAppt(true);
                closeModal();
            } else {
                const data = await response.json();
                showToast(data?.msg || "Failed to update appointment", "error");
            }
        } catch (error) {
            showToast("Network error! Please try again.", "error");
        }
    };


    return (
        <>
            <Navbar />
            <main className="appointment-page">
                <div className="container">
                    <div className="form-holder">
                        <form onSubmit={handleSubmit} className="appointment-form">
                            <div className="doctor-info">
                                <h4>Doctor Info</h4>
                                <select name="doctor" id="doctor" className="apt-dropdown doctor-dropdown" value={docId} onChange={async (e) => {
                                    setDocId(e.target.value);
                                }} required>
                                    <option value={""} key={0} disabled>Choose Your Doctor</option>
                                    {doctors.map((doc) => (<option value={doc.id} key={doc.id}>{doc.name}</option>))}
                                </select>
                            </div>
                            <div className="appointment-info">
                                <h4>Appointment Info</h4>
                                <div className="doc-info-container">
                                    <select name="date" id="date" value={date} className="apt-dropdown" onChange={(e) => {
                                        setDate(e.target.value);
                                        const docSchedule = docAvailable.find(schedule => schedule.schedule_date == e.target.value);
                                        console.log(docSchedule);
                                        if (docSchedule) {
                                            setWeekDay(docSchedule.week_day);
                                        }
                                    }} required>
                                        <option value="" disabled>Choose A Date</option>
                                        {docAvailable.map(schedule => (<option value={schedule.schedule_date} key={schedule.schedule_date}>{schedule.schedule_date}</option>))}
                                    </select>
                                    <select name="time" id="time" value={time}
                                        className="apt-dropdown"
                                        onChange={(e) => setTime(e.target.value)} required>
                                        <option value="" disabled>Choose Time</option>
                                        {times.map((time) => (<option value={`${time.start}-${time.end}`} key={time.start}>{time.start}-{time.end}</option>))}
                                    </select>
                                </div>
                            </div>
                            <div className="btn-container">
                                <button type="submit" disabled={booking} className="btn apt-submit-btn">Book Appointment</button>
                            </div>
                        </form>
                    </div>
                    <div className="history-holder">
                        {appointments.map(appt => (
                            <AppointmentHistory
                                key={appt.id}
                                appointment={appt}
                                onClick={() => handleAppointmentClick(appt)}
                            />
                        ))}
                    </div>
                </div>


                {isModalOpen && selectedAppointment && (
                    <AppointmentModal
                        appointment={selectedAppointment}
                        isEditing={isEditing}
                        editData={editData}
                        onClose={closeModal}
                        onEdit={() => setIsEditing(true)}
                        onCancelEdit={() => setIsEditing(false)}
                        onSaveEdit={handleEditAppointment}
                        onCancel={handleCancelAppointment}
                        onEditDataChange={setEditData}
                    />
                )}
            </main>
            <Footer />
        </>
    );
};

const AppointmentHistory = ({ appointment, onClick }) => {
    let className = appointment.status ? `appointment-item ${appointment.status}` : `appointment-item`;
    className += ' block-animate';

    return (
        <div className={className}>
            <button className="container" onClick={onClick} type="button">
                <p className="patient-name appointment-info">{appointment.patient_name}</p>
                <span className="col-separator"></span>
                <p className="doctor-name appointment-info">{appointment.doctor_name}</p>
                <span className="col-separator"></span>
                <p className="date appointment-info">{appointment.date}</p>
                <span className="col-separator"></span>
                <p className="time appointment-info">{appointment.time}</p>
            </button>
        </div>
    );
};


const AppointmentModal = ({
    appointment,
    isEditing,
    editData,
    onClose,
    onEdit,
    onCancelEdit,
    onSaveEdit,
    onCancel,
    onEditDataChange
}) => {
    console.log("Appointment :", appointment);
    const [docAvailable, setDocAvailable] = useState([]);
    const [times, setTimes] = useState([]);

    useEffect(() => {
        const getDocSchedule = async () => {
            try {
                const response = await fetch(`/suncarehospital/doctors/nextschedule?doctorId=${appointment.doctor_id}`, { method: 'GET' });
                const data = await response.json();
                setDocAvailable(data);
            } catch (error) {
                console.log(error);
            }
        }

        getDocSchedule();
    }, []);

    useEffect(() => {
        const getTimeSchedule = async () => {
            try {
                const response = await fetch(`/suncarehospital/doctors/timeschedule?doctorId=${appointment.doctor_id}&week_day=${editData.date.week_day}`, { method: 'GET' });

                const data = await response.json();

                setTimes(data);
                console.log(data);
            } catch (error) {

            }
        }

        if (editData.date !== "") getTimeSchedule();
    }, [editData.date]);


    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return '#fbbf24';
            case 'succesful': return '#10b981';
            case 'canceled': return '#ef4444';
            default: return '#6b7280';
        }
    };


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Appointment Details</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="appointment-detail-grid">
                        <div className="detail-row">
                            <span className="detail-label">Patient:</span>
                            <span className="detail-value">{appointment.patient_name}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Doctor:</span>
                            <span className="detail-value">{appointment.doctor_name}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Date:</span>
                            {isEditing ? (
                                <select
                                    // value={editData.date}
                                    onChange={(e) => {
                                        const docSchedule = docAvailable.find(schedule => schedule.schedule_date == e.target.value);
                                        //console.log(docSchedule);
                                        if (docSchedule) {
                                            onEditDataChange({ ...editData, date: docSchedule });
                                        }
                                    }}
                                    className="edit-input"
                                >
                                    <option value="">Select Date</option>
                                    {docAvailable.map(schedule => (
                                        <option key={schedule.schedule_date} value={schedule.schedule_date}>
                                            {schedule.schedule_date}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <span className="detail-value">{appointment.date}</span>
                            )}
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Time:</span>
                            {isEditing ? (
                                <select
                                    value={editData.time}
                                    onChange={(e) => onEditDataChange({ ...editData, time: e.target.value })}
                                    className="edit-input"
                                >
                                    <option value="">Select Time</option>
                                    {times.map(time => (
                                        <option key={time.start} value={`${time.start}-${time.end}`}>
                                            {time.start}-{time.end}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <span className="detail-value">{appointment.time}</span>
                            )}
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Status:</span>
                            <span
                                className="status-badge"
                                style={{ backgroundColor: getStatusColor(appointment.status) }}
                            >
                                {appointment.status?.toUpperCase() || 'UNKNOWN'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    {appointment.status?.toLowerCase() === 'pending' && !isEditing && (
                        <>
                            <button className="btn btn-secondary" onClick={onEdit}>
                                Edit Appointment
                            </button>
                            <button className="btn btn-danger" onClick={onCancel}>
                                Cancel Appointment
                            </button>
                        </>
                    )}

                    {isEditing && (
                        <>
                            <button className="btn btn-secondary" onClick={onCancelEdit}>
                                Cancel Edit
                            </button>
                            <button className="btn btn-primary" onClick={onSaveEdit}>
                                Save Changes
                            </button>
                        </>
                    )}

                    {!isEditing && (
                        <button className="btn btn-primary" onClick={onClose}>
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Appointment;