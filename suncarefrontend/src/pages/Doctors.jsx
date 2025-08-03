import React, { useEffect, useState } from "react";
import { DoctorCard, Navbar, Footer } from "../component";
import Skeleton from "react-loading-skeleton";

const Doctors = () => {
    const [loading, setLoading] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(10); // Initialize with 1
    const [searchParams, setSearchParams] = useState({
        name: "",
        degree: "",
        subject: "",
        designation: ""
    });
    const [options, setOptions] = useState({
        degrees: [],
        subjects: [],
        designations: []
    });

    const limit = 10;

    useEffect(() => {
        const getOptions = async () => {
            try {
                const [degreeResponse, subjectResponse, desigResponse] = await Promise.all([
                    fetch(`/suncarehospital/options/degrees`, { method: "GET" }),
                    fetch(`/suncarehospital/options/subjects`, { method: "GET" }),
                    fetch(`/suncarehospital/options/designations`, { method: "GET" })
                ]);

                const [degrees, subjects, designations] = await Promise.all([
                    degreeResponse.json(),
                    subjectResponse.json(),
                    desigResponse.json()
                ]);

                setOptions({ degrees, subjects, designations });
            } catch (error) {
                console.log(error);
            }
        };

        getOptions();
    }, []);

    const fetchDoctors = async (pageNum, searchParams) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', pageNum);
            params.append('limit', limit);

            // Add search parameters if they exist
            if (searchParams.name) params.append('name', searchParams.name);
            if (searchParams.degree) params.append('degree', searchParams.degree);
            if (searchParams.subject) params.append('subject', searchParams.subject);
            if (searchParams.designation) params.append('desig', searchParams.designation);

            const response = await fetch(
                `/suncarehospital/doctors/search?${params.toString()}`,
                { method: 'GET' }
            );

            const data = await response.json();

            const response1 = await fetch(
                `/suncarehospital/doctors/search/count?${params.toString()}`,
                { method: 'GET' }
            );
            const data1 = await response1.json();
            
            console.log(data1);
            setTotalPages(data1.total_count/limit);
            setDoctors(data.doctors || data); // Adjust based on your API response structure
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors(page, searchParams);
    }, [page, searchParams]);

    const goToNextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    };

    const goToPreviousPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    const handleSearchChange = (newParams) => {
        setSearchParams(newParams);
        setPage(1); // Reset to first page when search parameters change
    };

    const LoadingElement = () => {
        return (
            <>
                <div className="container skeleton-box">
                    <div className="image-container">
                        <Skeleton height={150} width={180}></Skeleton>
                    </div>
                    <div className="info-skeleton">
                        <Skeleton height={20} width={100}></Skeleton>
                        <Skeleton height={40}></Skeleton>
                        <Skeleton height={20}></Skeleton>
                        <Skeleton height={20}></Skeleton>
                        <Skeleton height={20}></Skeleton>
                        <Skeleton height={20}></Skeleton>
                    </div>
                </div>
            </>
        );
    }

    const Loading = () => {
        return (
            <>
                <main className="main">
                    <div className="container">
                        <div className="skeleton-container">
                            <div className="skeleton-search-container">
                                <div className="skeleton-search-bar">
                                    <Skeleton width={200} height={25}></Skeleton>
                                    <Skeleton width={50} height={25}></Skeleton>
                                </div>
                                <div className="skeleton-search-menu">
                                    <Skeleton width={100} height={25}></Skeleton>
                                    <Skeleton width={100} height={25}></Skeleton>
                                    <Skeleton width={100} height={25}></Skeleton>
                                </div>
                            </div>
                            <ul className="skeleton-list">
                                <li className="skeleton-item">
                                    <LoadingElement />
                                </li>
                                <li className="skeleton-item">
                                    <LoadingElement />
                                </li>
                                <li className="skeleton-item">
                                    <LoadingElement />
                                </li>
                                <li className="skeleton-item">
                                    <LoadingElement />
                                </li>
                                <li className="skeleton-item">
                                    <LoadingElement />
                                </li>
                                <li className="skeleton-item">
                                    <LoadingElement />
                                </li>
                                <li className="skeleton-item">
                                    <LoadingElement />
                                </li>
                                <li className="skeleton-item">
                                    <LoadingElement />
                                </li>
                                <li className="skeleton-item">
                                    <LoadingElement />
                                </li>
                            </ul>
                        </div>
                    </div>
                </main>
            </>
        );
    }


    const Pagination = () => {
        return (
            <>
                {page > 1 && (<button className="prev-btn page-btn btn" onClick={goToPreviousPage}>&lt;&lt;</button>)}
                <button className="curr-btn page-btn btn">{page}</button>
                {page < totalPages && (<button className="next-btn page-btn" onClick={goToNextPage}>&gt;&gt;</button>)}
            </>
        );
    }


    const LoadedDoctor = () => {
        return (
            <>
                <main className="main fade-in">
                    <SearchBox
                        searchParams={searchParams}
                        options={options}
                        onSearchChange={handleSearchChange}
                    />
                    <div className="container doctor-container">
                        {doctors.length > 0 ? (
                            <>
                                <ul className="doctors-list">
                                    {doctors.map(doc => (
                                        <li key={doc.id} className="doctor-item">
                                            <DoctorCard doctor={doc} />
                                        </li>
                                    ))}
                                </ul>
                                <div className="pagination-container">
                                    <Pagination />
                                </div>
                            </>
                        ) : (
                            <div className="no-results">
                                No doctors found matching your criteria
                            </div>
                        )}
                    </div>
                </main>
            </>
        );
    };

    return (
        <>
            <Navbar />
            <div className="doctors-page">
                {loading ? <Loading /> : <LoadedDoctor />}
            </div>
            <Footer />
        </>
    );
};

const SearchBox = ({ searchParams, options, onSearchChange }) => {
    const [degree, setDegree] = useState(searchParams.degree);
    const [subject, setSubject] = useState(searchParams.subject);
    const [name, setName] = useState(searchParams.name);
    const [designation, setDesignation] = useState(searchParams.designation);


    const searchBtnClick = () => {
        //console.log(name,degree,subject,designation);
        onSearchChange({
            ...searchParams,
            name: name,
            degree: degree,
            subject: subject,
            designation: designation
        });
    }

    return (
        <div className="container search-container">
            <form className="search-form">
                <div className="container searchbar-container">
                    <label htmlFor="name"></label>
                    <input
                        type="text"
                        value={name}
                        name="name"
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name"
                        className="name-field"
                        id="name-field"
                    />
                    <button className="btn src-btn" onClick={searchBtnClick}><i className="fa-solid fa-magnifying-glass"></i><span>Search</span></button>
                </div>
                <div className="container filter-container">
                    <div className="container degree-container">
                        <label htmlFor="degree" className="dropdownLabel"></label>
                        <select
                            name="degree"
                            id="degree"
                            className="dropdown"
                            value={degree}
                            onChange={(e) => setDegree(e.target.value)}
                        >
                            <option value="">Degree(None)</option>
                            {options.degrees.map((degree) => (
                                <option value={degree.id} key={degree.id}>{degree.degree}</option>
                            ))}
                        </select>
                    </div>
                    <div className="container subject-container">
                        <label htmlFor="subject" className="dropdownLabel"></label>
                        <select
                            name="subject"
                            id="subject"
                            className="dropdown"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        >
                            <option value="">Subject(None)</option>
                            {options.subjects.map((subject) => (
                                <option value={subject.id} key={subject.id}>{subject.subject}</option>
                            ))}
                        </select>
                    </div>
                    <div className="container designation-container">
                        <label htmlFor="designation" className="dropdownLabel"></label>
                        <select
                            name="designation"
                            id="designation"
                            className="dropdown"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                        >
                            <option value="">Designation(None)</option>
                            {options.designations.map((designation) => (
                                <option value={designation.id} key={designation.id}>{designation.designation}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Doctors;