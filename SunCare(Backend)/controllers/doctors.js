const asyncHandler = require("../middleware/async");
const { getConnection } = require('../middleware/database');
const { doctorDetails, multiParamDoctorSearch, singleParamDoctorSearch,singleParamDoctorSearchCnt } = require('../utils/doctors');

//@desc    Doctors Details
//@route   GET /suncarehospital/doctors
//@access  Public

exports.getDoctors = asyncHandler(async (req, res, next) => {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 20;

    const offset = (page - 1) * limit;

    try {
        const connection = await getConnection();
        const [rows] = await connection.execute('CALL GET_DOCTORS(?,?)', [offset, limit]);
        const docArray = Array.isArray(rows[0]) ? rows[0] : [];

        const enrichedDoctors = await doctorDetails(docArray);

        res.status(200).json(enrichedDoctors);
    } catch (error) {
        res.status(400).json("Internal Error!");
    }
});

//@desc    Doctors Details
//@route   GET /suncarehospital/doctors/:id
//@access  Public

exports.getDoctor = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    console.log(id);

    try {
        const connection = await getConnection();
        const [rows] = await connection.execute('CALL GET_DOCTOR_NAME(?)', [id]);

        const docArray = Array.isArray(rows[0]) ? rows[0] : [];

        const enrichedDoctors = await doctorDetails(docArray);
        if (enrichedDoctors.length > 0)
            res.status(200).json(enrichedDoctors[0]);
        else res.status(404).json({ success: false, msg: "Not Found" });
    } catch (error) {
        res.status(400).json("Internal Error!");
    }
});


//@desc     Search Doctors on various criteria
//@routes   GET /suncarehospital/doctors/search
//@access   Public

exports.searchDoctors = asyncHandler(async (req, res, next) => {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 20;

    const offset = (page - 1) * limit;
    try {

        let name = req.query.name;
        let degrees = req.query.degree;
        let subjects = req.query.subject;
        let desigs = req.query.desig;



        name = name ? name : null;

        let rows = null;
        if (Array.isArray(degrees) || Array.isArray(degrees) || Array.isArray(degrees)) {
            rows = await multiParamDoctorSearch(name, degrees, subjects, desigs, offset, limit);
        } else {
            rows = await singleParamDoctorSearch(name, degrees, subjects, desigs, offset, limit);
        }

        rows = await doctorDetails(rows[0]);

        res.status(200).json(rows);
    } catch (error) {
        //console.log(error);
        res.status(400).json("Internal Error");
    }
});

//@desc     Returns doctors searched count
//@routes   GET /suncarehospital/doctors/search/count
//@access   Public

exports.searchDoctorsCnt = asyncHandler(async (req, res, next) => {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 20;

    const offset = (page - 1) * limit;
    try {

        let name = req.query.name;
        let degrees = req.query.degree;
        let subjects = req.query.subject;
        let desigs = req.query.desig;



        name = name ? name : null;

        let rows = null;
        if (Array.isArray(degrees) || Array.isArray(degrees) || Array.isArray(degrees)) {
            rows = await multiParamDoctorSearch(name, degrees, subjects, desigs, offset, limit);
        } else {
            rows = await singleParamDoctorSearchCnt(name, degrees, subjects, desigs, offset, limit);
        }

        res.status(200).json(rows[0][0]);
    } catch (error) {
        res.status(400).json("Internal Error");
    }
});


//@desc     Give Doctors Next Seven Days Schedule
//@routes   GET /suncarehospital/doctors/nextschedule
//@access   Public

exports.getNextSevenDays = asyncHandler(async (req, res, next) => {
    const doctorId = req.query.doctorId;

    if (!doctorId) {
        return res.status(400).json({ msg: "Missing Doctor Id" });
    }

    try {
        const connection = await getConnection();

        const [rows] = await connection.execute('CALL GET_NEXT_SEVEN_SCHEDULE_DATE(?)', [doctorId]);

        //console.log(rows);

        res.status(200).json(rows[0]);

    } catch (error) {
        console.log(error);
        return res.status(400).json({ msg: "Internal Server Error" });
    }
});



//@desc     Give Doctors Time Schedule given doctor id and week day
//@routes   GET /suncarehospital/doctors/timeschedule
//@access   Public

exports.getTimeSchedule = asyncHandler(async (req, res, next) => {
    const doctorId = req.query.doctorId;
    const week_day = req.query.week_day;

    console.log(doctorId,week_day);

    if (!doctorId || !week_day) {
        return res.status(400).json({ msg: "Missing Query Params" });
    }

    try {
        const connection = await getConnection();

        const [rows] = await connection.execute('CALL GET_TIME_SCHEDULE(?,?)', [doctorId, week_day]);

        //console.log(rows);

        res.status(200).json(rows[0]);

    } catch (error) {
        console.log(error);
        return res.status(400).json({ msg: "Internal Server Error" });
    }
});