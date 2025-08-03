const asyncHandler = require('../middleware/async');
const { getConnection } = require('../middleware/database');

//@desc    Generate Appointment
//@route   POST /suncarehospital/appointment/book
//@access  Private

exports.bookAppointment = asyncHandler(async (req, res, next) => {

      if (!req.body) {
            return res.status(401).json({ msg: "missing parameters" });
      }

      const patientId = req.body.patientId
      const doctorId = req.body.doctorId;
      const date = req.body.date;
      const startTime = req.body.start;
      const endTime = req.body.end;


      if (!doctorId || !patientId || !date || !startTime || !endTime) {
            return res.status(401).json({ msg: "Missing Information!Provide All info!" });
      }

      try {
            const connection = await getConnection();

            const [results] = await connection.execute('CALL BOOK_APPOINTMENT(?,?,?,?,?)', [patientId, doctorId, date, startTime, endTime]);
      } catch (error) {
            if(error?.sqlState==45000){
                  return res.status(500).json({msg:error.sqlMessage});
            }
            return res.status(500).json({ msg: "Internal Server Error! Please Try Later" });
      }
      //console.log(id,name,dob,gender,phone,doctor,date,startTime);

      return res.status(200).json({ success: true, msg: "Succesfully Booked Appointment" });
});

//@desc    Edit Appointment
//@route   PUT /suncarehospital/appointment/update/:id
//@access  Private
exports.updateAppointment = asyncHandler(async (req, res, next) => {
      const id = req?.params?.id;
      const details = req.body;
      //console.log(details);
      if (!id)
            return res.status(400).json({ success: false, msg: "Missing Query Parameters" });

      try {
            const connection = await getConnection();
            const response=await connection.execute('CALL UPDATE_APPOINTMENT(?,?,?,?)',[id,details.date.schedule_date,details.start,details.end]);
            return res.status(200).json({ success: true, msg: "Succesful" });
      } catch (error) {
            //console.log(error);
            return res.status(500).json({ success: false, msg: "Internal Server Error!" });
      }
});

//@desc    Cancel Appointment
//@route   PUT /suncarehospital/appointment/cancel/:id
//@access  Private
exports.cancelAppointment = asyncHandler(async (req, res, next) => {
      const id = req?.params?.id;
      //console.log(id);
      if (!id)
            return res.status(400).json({ success: false, msg: "Missing Query Parameters" });

      try {
            const connection = await getConnection();
            const response=await connection.execute('CALL CANCEL_APPOINTMENT(?)',[id]);
            return res.status(200).json({ success: true, msg: "Succesful" });
      } catch (error) {
            return res.status(500).json({ success: false, msg: "Internal Server Error!" });
      }
});


//@desc   get appointments
//@route  GET /suncarehospital/appointment/appointments
//@access Private
exports.getAppointments = asyncHandler(async (req, res, next) => {
      if (!req.user) {
            return res.status(400).json({ success: false, msg: "Missing Info!" });
      }

      try {
            const connection = await getConnection();
            const { user } = req;

            // console.log(user);
            const [rows] = await connection.execute('CALL GET_APPOINTMENT_INFO(?)', [user.patient_id]);

            // console.log(rows);
            return res.status(200).json({ success: true, appointments: rows[0], msg: "Successfuylly Retrieved Details!" });
      } catch (error) {
            // console.log(error);
            return res.status(400).json({ sucess: false, msg: "Intenal server Error!" });
      }
});