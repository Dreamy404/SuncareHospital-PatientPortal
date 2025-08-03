const asyncHandler = require('../middleware/async');
const { getConnection } = require('../middleware/database');

//@desc    Get Subjects
//@route   GET suncarehospital/options/subjects
//@access  public

exports.getSubjects = asyncHandler(async (req, res, next) => {
    try {
        const connection = await getConnection();

        const [rows] = await connection.execute('SELECT subject_id as id,subject FROM SUBJECT');

        res.status(200).json(rows);
    } catch (error) {
        res.status(400).json({ msg: "Internal Error", err: error });
    }
});

//@desc    Get Degrees
//@route   GET suncarehospital/options/degrees
//@access  public

exports.getDegrees = asyncHandler(async (req, res, next) => {
    try {
        const connection = await getConnection();

        const [rows] = await connection.execute('SELECT degree_id as id,degree FROM DEGREE');

        res.status(200).json(rows);
    } catch (error) {
        res.status(400).json("Internal Error");
    }
});

//@desc    Get Designations
//@route   GET suncarehospital/options/designations
//@access  public

exports.getDesignations = asyncHandler(async (req, res, next) => {
    try {
        const connection = await getConnection();

        const [rows] = await connection.execute('SELECT designation_id as id,designation FROM DESIGNATION');

        res.status(200).json(rows);
    } catch (error) {
        res.status(400).json("Internal Error");
    }
});

//@desc    Get Doctors As Options
//@route   GET suncarehospital/options/doctors
//@access  public/private
exports.getDoctors = asyncHandler(async (req, res, next) => {
    try {
        const connection = await getConnection();

        const [rows] = await connection.execute('CALL GET_ALL_DOCTORS_LIMITED()');

        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(400).json("Internal Error");
    }
});

//@desc    Get services
//@route   GET suncarehospital/options/services
//@access  public
exports.getServices = asyncHandler(async (req, res, next) => {
    try {
        const connection = await getConnection();

        const [rows] = await connection.execute('CALL GET_ALL_SERVICES()');

        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(400).json("Internal Error");
    }
});


