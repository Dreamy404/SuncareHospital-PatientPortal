const asyncHandler = require('../middleware/async');
const { getConnection } = require('../middleware/database');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Handlebars = require('handlebars');
const apiKey = process.env.IMGBB_API_KEY;
const FormData = require("form-data");

//@desc    Profile Details
//@route   GET /patient/profile/:id
//@access  Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ success: false, msg: "Missing parameters" });
  }

  try {
    const connection = await getConnection();

    const [rows] = await connection.execute('CALL GET_PROFILE_DETAILS(?)', [id]);

    //console.log(rows[0]);
    return res.status(200).json(rows[0][0]);
  } catch (error) {
    return res.status(500).json({ success: false, msg: "Internal Server Error!" });
  }
});


//@desc    Pescriptions
//@route   GET /patient//pescriptions
//@access  Private
exports.getPrescriptions = asyncHandler(async (req, res, next) => {
  try {
    const connection = await getConnection();
    // console.log("In Prescriptions");
    const [rows] = await connection.execute("CALL GET_ALL_PRESCRIPTIONS(?)", [req.user.patient_id]);
    console.log(rows);
    if (rows.length > 0) {
      return res.status(200).json(rows[0]);
    }
    return res.status(200).json([]);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, msg: "Internal Server Error" });
  }
});


//@desc    reports
//@route   GET /patient//reports
//@access  Private
exports.getReports = asyncHandler(async (req, res, next) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute("CALL GET_TEST_REPORTS(?)", [req.user.patient_id]);
    //console.log(rows);
    if (rows.length > 0) {
      return res.status(200).json(rows[0]);
    }
    return res.status(200).json([]);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, msg: "Internal Server Error" });
  }
});


//@desc    Doctors Details
//@route   GET /patient/prescription/:id
//@access  Private
exports.getPrescription = asyncHandler(async (req, res, next) => {
  // Load and compile the report view
  const id = req.params.id;
  const user = req.user;
  //console.log("Pdf request recieved",id,user);

  try {
    const connection = await getConnection();
    let [rows] = await connection.execute('CALL GET_THE_PRESCRIPTION(?)', [id]);

    if (rows.length > 0) {
      const pescription = rows[0][0];
      let doctor = {};
      let patient = {};
      [rows] = await connection.execute('CALL GET_DOCTOR_NAME(?)', [pescription.doctor_id]);
      doctor.name = rows[0][0].name;
      [rows] = await connection.execute('CALL DOCTOR_DEGREES(?)', [pescription.doctor_id]);
      doctor.degrees = rows[0];

      [rows] = await connection.execute('CALL GET_PATIENT_DETAILS(?)', [pescription.patient_id]);
      patient = { ...rows[0][0] };
      patient.bp = pescription.bp;
      patient.weight = pescription.weight;
      patient.history = pescription.history;

      [rows] = await connection.execute('CALL GET_PRESCRIBED_MEDICINE(?)', [pescription.id]);

      const medicines = rows[0];

      [rows] = await connection.execute('CALL GET_PRESCRIBED_TESTS(?)', [pescription.id]);

      const tests = rows[0];
      const date = pescription.date;

      //pdf generation
      const reportPath = path.join(__dirname, '..', 'views', 'pages', 'pescription.handlebars');
      const reportHtml = fs.readFileSync(reportPath, 'utf8');
      const reportTemplate = Handlebars.compile(reportHtml);

      // console.log(doctor,date,patient,medicines,tests);

      const htmlBody = reportTemplate({ doctor: doctor, date: date, patient: patient, medicines: medicines, tests: tests });

      // Load and compile the layout
      const layoutPath = path.join(__dirname, '..', 'views', 'layouts', 'main.handlebars');
      const layoutHtml = fs.readFileSync(layoutPath, 'utf8');
      const layoutTemplate = Handlebars.compile(layoutHtml);

      // Inline CSS
      const cssPath = path.join(__dirname, '..', 'public', 'css', 'reportStyle.css');
      const css = fs.readFileSync(cssPath, 'utf8');

      // Inline image as base64
      const logoPath = path.join(__dirname, '..', 'public', 'images', 'bacgroundless.png');
      const logoBase64 = fs.readFileSync(logoPath).toString('base64');
      const logoSrc = `data:image/png;base64,${logoBase64}`;

      // Final HTML
      const fullHtml = layoutTemplate({
        body: htmlBody,
        inlineCSS: `<style>${css}</style>`,
        logoSrc
      });

      // Generate PDF
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true
      });

      await browser.close();

      // Send PDF to user
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="prescription.pdf"');
      res.setHeader('Content-Length', pdfBuffer.length);
      return res.send(pdfBuffer);

    }
    return res.status(404).json({ success: false, msg: "No such resources!" });
  } catch (error) {
    return res.status(500).json({ success: false, msg: "Internal Server Error!" });
  }
});



//@desc    Doctors Details
//@route   GET /patient//getPdf
//@access  Public

exports.getPdf = async (req, res) => {
  // Load and compile the report view
  console.log("Pdf request recieved");
  const reportPath = path.join(__dirname, '..', 'views', 'pages', 'pescription.handlebars');
  const reportHtml = fs.readFileSync(reportPath, 'utf8');
  const reportTemplate = Handlebars.compile(reportHtml);

  const doctor = {
    name: "Professor Dr. Amamul Kabir",
    degrees: [
      { name: "MBBS", institution: "DMC" },
      { name: "MBBS", institution: "DMC" },
      { name: "MBBS", institution: "DMC" },
      { name: "MBBS", institution: "DMC" },
      { name: "MBBS", institution: "DMC" }
    ]
  };
  const date = '12 Jan 2024';
  const patient = {
    name: "Md Rubayat",
    age: "22",
    gender: "Male",
    address: "Dhaka",
    weight: "56kg",
    bp: "90/120",
    history: "diabetes"
  }
  const medicines = [
    { name: "Pracetamol", distribution: "1-0-1", duration: "23days" },
    { name: "Gilmet", distribution: "1-1-1", duration: "30 days" },
    { name: "Chilipet", distribution: "1-0-0", duration: "15 days" },
    { name: "Chilipet", distribution: "1-0-0", duration: "15 days" },
    { name: "Chilipet", distribution: "1-0-0", duration: "15 days" },
    { name: "Chilipet", distribution: "1-0-0", duration: "15 days" },
    { name: "Chilipet", distribution: "1-0-0", duration: "15 days" },
    { name: "Chilipet", distribution: "1-0-0", duration: "15 days" },
    { name: "Chilipet", distribution: "1-0-0", duration: "15 days" },
    { name: "Chilipet", distribution: "1-0-0", duration: "15 days" }
  ];

  const tests = ["X-ray", "CBC", "CT SCan"];
  const htmlBody = reportTemplate({ doctor, date, patient, medicines, tests });

  // Load and compile the layout
  const layoutPath = path.join(__dirname, '..', 'views', 'layouts', 'main.handlebars');
  const layoutHtml = fs.readFileSync(layoutPath, 'utf8');
  const layoutTemplate = Handlebars.compile(layoutHtml);

  // Inline CSS
  const cssPath = path.join(__dirname, '..', 'public', 'css', 'reportStyle.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  // Inline image as base64
  const logoPath = path.join(__dirname, '..', 'public', 'images', 'bacgroundless.png');
  const logoBase64 = fs.readFileSync(logoPath).toString('base64');
  const logoSrc = `data:image/png;base64,${logoBase64}`;

  // Final HTML
  const fullHtml = layoutTemplate({
    body: htmlBody,
    inlineCSS: `<style>${css}</style>`,
    logoSrc
  });

  // Generate PDF
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true
  });

  await browser.close();

  // Send PDF to user
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="prescription.pdf"');
  res.setHeader('Content-Length', pdfBuffer.length);
  res.send(pdfBuffer);

  // res.set({
  //   'Content-Type': 'application/pdf',
  //   'Content-Disposition': 'attachment; filename="report.pdf"',
  // });
  // res.send(pdfBuffer);
};


//@desc    Uploads Profile Picture
//@route   POST /patient/profile-upload
//@access  Public
exports.uploadProfile = asyncHandler(async (req, res, next) => {
  console.log('in upload profile');
  console.log(req.file);
  console.log(req.user);
  try {
    const form = new FormData();
    form.append('image', req.file.buffer.toString('base64')); // ImgBB expects base64
    // form.append('name', req.file.originalname);

    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, form, {
      headers: form.getHeaders(),
    });

    console.log(response.data);
    const imageLink = response?.data?.data?.image?.url;
    const deleteLink = response?.data?.data?.delete_url;
    console.log(imageLink, deleteLink);

    const connection = await getConnection();

    await connection.query("SET @prevDeleteLink=''");
    await connection.execute('CALL UPDATE_IMAGE_LINK(?,?,?,@prevDeleteLink)', [req.user.patient_id, imageLink, deleteLink]);

    const [rows] = await connection.query('SELECT @prevDeleteLink AS deleteLink');
    //console.log(rows);
    if (rows.length > 0) {
      //console.log(rows[0].deleteLink);
      try {
        await axios.get(rows[0].deleteLink);
      } catch (error) {
        //console.log(error);
      }
    }

    //console.log('Upload successful:', response.data);
    return res.status(200).json(response.data);
  } catch (error) {
    //console.log('Upload failed:', error.response?.data || error.message);
    return res.status(500).json({ success: false, msg: 'Internal Server Error' });
  }
});

