import React, { useEffect, useRef, useState } from "react";
import {
    Navbar,
    Footer
} from '../component';
import { Link } from "react-router-dom";
import { useAuth } from "../context";

const Patient = () => {
    const [pescription, setPescription] = useState(false);
    const [report, setReport] = useState(false);
    const { authState, user } = useAuth();
    const [pescriptions, setPescriptions] = useState([]);
    const [reports, setReports] = useState([{ id: 234, name: "CBC", date: "21/12/2022", status: "complete" },
    { id: 234, name: "CBC", date: "21/12/2022", status: "pending" },
    { id: 234, name: "Testosteron", date: "21/12/2022", status: "complete" },
    { id: 234, name: "CBC", date: "21/12/2022", status: "complete" }
    ]);

    useEffect(() => {
        const getPrescription = async () => {
            try {
                const response = await fetch("suncarehospital/patient/prescriptions", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authState.accessToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    setPescriptions(data);
                }
            } catch (error) {
                console.log(error);
            }
        };

        const getReports = async () => {
            try {
                const response = await fetch("suncarehospital/patient/reports", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authState.accessToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setReports(data);
                }
            } catch (error) {
                console.log(error);
            }
        };

        getPrescription();
        getReports();
    }, [authState.accessToken]);


    const Pescription = () => {
        const containerRef = useRef(null);

        useEffect(() => {
            const handleClick = async (e) => {
                const anchor = e.target.closest('a[data-pdf]');
                if (!anchor) return;
                console.log('Hi in Pescription');
                e.preventDefault();

                const url = anchor.getAttribute('data-pdf');

                try {
                    // Method 1: Use fetch with blob
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${authState.accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const blob = await response.blob();
                        const downloadUrl = window.URL.createObjectURL(blob);

                        const tempLink = document.createElement('a');
                        tempLink.href = downloadUrl;
                        tempLink.setAttribute('download', 'prescription.pdf');
                        document.body.appendChild(tempLink);
                        tempLink.click();
                        document.body.removeChild(tempLink);

                        // Clean up the object URL
                        window.URL.revokeObjectURL(downloadUrl);
                    } else {
                        console.error('Failed to download PDF');
                    }
                } catch (error) {
                    console.error('Error downloading PDF:', error);
                }
            };

            const container = containerRef.current;
            container?.addEventListener('click', handleClick);
            console.log(container);
            return () => {
                container?.removeEventListener('click', handleClick);
            };
        }, [authState.accessToken]);

        return (
            <>
                <div className="table-container" ref={containerRef}>
                    <table className="pescription-table">
                        <caption><i className="fa-solid fa-prescription"></i> Prescriptions</caption>
                        <tbody>
                            <tr className="pesc-item-header pescription-item" key={0}>
                                <th>Prescription Id</th>
                                <th>Doctor Name</th>
                                <th>Visit Date</th>
                                <th>Download</th>
                            </tr>
                            {pescriptions.length ? (pescriptions.map(pesc => (
                                <tr className="pescription-item" key={pesc.id}>
                                    <td>{pesc.id}</td>
                                    <td>{pesc.doctor}</td>
                                    <td>{pesc.date}</td>
                                    <td><a href="javascript:void(0)" data-pdf={`/suncarehospital/patient/prescription/${pesc.id}`} rel="noreferrer">Download</a></td>
                                </tr>
                            ))) : (
                                <tr>
                                    <td colSpan={4} className="no-item-found">No Prescription Found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </>
        );
    }

    const Report = () => {

        return (
            <>
                <div className="table-container">
                    <table className="pescription-table">
                        <caption><i className="fa-solid fa-vial"></i> Reports</caption>
                        <tbody>
                            <tr className="pesc-item-header pescription-item" key={0}>
                                <th>Report Id</th>
                                <th>Test Name</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                            {reports.length > 0 ? <>
                                {reports.map(rep => (
                                    <tr className="pescription-item" key={rep.id}>
                                        <td>{rep.id}</td>
                                        <td>{rep.name}</td>
                                        <td>{rep.status}</td>
                                        <td>{rep.date}</td>
                                    </tr>
                                ))}

                                <tr>
                                    <td colSpan={4} className="no-item-found">Completed Report can be collected from the report counter</td>
                                </tr>
                            </> : (
                                <tr>
                                    <td colSpan={4} className="no-item-found">No Report Found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </>

        );
    }

    const Profile = () => {
        const [profileData, setProfileData] = useState({
            name: "John Doe",
            dateOfBirth: "1990-05-15",
            phone: "+1 (555) 123-4567",
            email: "john.doe@email.com",
            address: "123 Main Street, City, State 12345",
            profilePhoto: null
        });

        useEffect(() => {
            const getProfile = async () => {
                try {
                    const response = await fetch(`suncarehospital/patient/profile/${user.patient_id}`, {
                        method: "GET",
                        headers: {
                            'Authorization': `Bearer ${authState.accessToken}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log(data);
                        setProfileData(data);
                    }
                } catch (error) {
                    console.log(error);
                }
            };
            if (user) {
                getProfile();
            }
        }, []);

        const fileInputRef = useRef(null);

        const handleProfilePhotoUpdate = async (event) => {
            const file = event.target.files[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    alert('Please select a valid image file');
                    return;
                }

                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('File size should be less than 5MB');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    setProfileData(prev => ({
                        ...prev,
                        profilePhoto: e.target.result
                    }));
                };
                reader.readAsDataURL(file);

                const formData = new FormData();
                formData.append('file', file);

                try {
                    const response = await fetch('suncarehospital/patient/profile-upload', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${authState.accessToken}`
                        },
                        body: formData
                    });

                    if (response.ok) {

                    }
                } catch (error) {
                    console.log(error);
                }
            }
        };

        const triggerFileInput = () => {
            fileInputRef.current?.click();
        };

        const removePhoto = () => {
            setProfileData(prev => ({
                ...prev,
                profilePhoto: null
            }));
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };

        return (
            <div className="profile-container">
                <div className="profile-header">
                    <i className="fa-solid fa-user"></i>
                    <span>Patient Profile</span>
                </div>

                <div className="profile-content">
                    <div className="profile-photo-section">
                        <div className="photo-container">
                            {profileData.profilePhoto ? (
                                <img
                                    src={profileData.profilePhoto}
                                    alt="Profile"
                                    className="profile-photo"
                                />
                            ) : (
                                <div className="default-avatar">
                                    <i className="fa-solid fa-user"></i>
                                </div>
                            )}
                            <div className="photo-overlay">
                                <button
                                    type="button"
                                    className="update-photo-btn"
                                    onClick={triggerFileInput}
                                >
                                    <i className="fa-solid fa-camera"></i>
                                </button>
                                {profileData.profilePhoto && (
                                    <button
                                        type="button"
                                        className="remove-photo-btn"
                                        onClick={removePhoto}
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleProfilePhotoUpdate}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div className="profile-info">
                        <div className="info-row">
                            <div className="info-label">
                                <i className="fa-solid fa-user"></i>
                                <span>Full Name</span>
                            </div>
                            <div className="info-value">{profileData.patient_name}</div>
                        </div>

                        <div className="info-row">
                            <div className="info-label">
                                <i className="fa-solid fa-calendar"></i>
                                <span>Date of Birth</span>
                            </div>
                            <div className="info-value">
                                {profileData.dateOfBirth}
                            </div>
                        </div>

                        <div className="info-row">
                            <div className="info-label">
                                <i className="fa-solid fa-phone"></i>
                                <span>Phone Number</span>
                            </div>
                            <div className="info-value">{profileData.phone}</div>
                        </div>

                        <div className="info-row">
                            <div className="info-label">
                                <i className="fa-solid fa-envelope"></i>
                                <span>Email Address</span>
                            </div>
                            <div className="info-value">{profileData.email}</div>
                        </div>

                        <div className="info-row">
                            <div className="info-label">
                                <i className="fa-solid fa-location-dot"></i>
                                <span>Address</span>
                            </div>
                            <div className="info-value">{profileData.address}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <main className="patient-page">
                <div className="patient-container">
                    <ul className="patient-nav">
                        <li className="p-nav-item">
                            <button className={(!pescription && !report ? `active` : ``)} onClick={(event) => {
                                setPescription(false);
                                setReport(false);
                            }}>Profile</button>
                        </li>
                        <li className="p-nav-item">
                            <button className={(pescription ? `active` : ``)} onClick={(event) => {
                                setPescription(true);
                                setReport(false);

                            }}>Prescriptions</button>
                        </li>
                        <li className="p-nav-item">
                            <button className={(report ? `active` : ``)} onClick={(event) => {
                                setReport(true);
                                setPescription(false);
                            }}>Diagnostics</button>
                        </li>
                    </ul>
                    <div className="patient-content">
                        {pescription ? <Pescription /> : (report ? <Report /> : <Profile />)}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}

export default Patient;