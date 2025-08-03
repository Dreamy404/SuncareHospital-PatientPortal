const express = require('express');
require('dotenv').config();
const cors = require('cors');
const db = require('./middleware/database.js');
const cookieParser=require('cookie-parser');
const {engine}=require('express-handlebars');
const path=require('path');


const doctorRoutes=require('./routes/doctors.js');
const authRoutes=require('./routes/auth.js');
const optionRoutes=require('./routes/options.js');
const appointmentRoutes=require('./routes/appointment.js');
const patientRoutes=require('./routes/patient.js');
const reviewRoutes=require('./routes/review.js');

const apiRoutes=(routeName)=>`/suncarehospital/${routeName}`;

const app = express();
app.use(cors({
    origin:"http://localhost:3000",
    credentials:true
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname,'public')));

app.use(apiRoutes('doctors'),doctorRoutes);
app.use(apiRoutes('auth'),authRoutes);
app.use(apiRoutes('options'),optionRoutes);
app.use(apiRoutes('appointment'),appointmentRoutes);
app.use(apiRoutes('patient'),patientRoutes);
app.use(apiRoutes('review'),reviewRoutes);


//handlebars setup for pdf testing
app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'browserVersion/pdftemplates/layouts'),
  partialsDir: path.join(__dirname, 'browserVersion/pdftemplates/partials')
}));

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'browserVersion/pdftemplates/pages'));

app.get('/pdf',async (req,res,next)=>{
     console.log("hi");
     const doctor={
        name:"Professor Dr. Amamul Kabir",
        degrees:[
            {name:"MBBS",institution:"DMC"},
            {name:"MBBS",institution:"DMC"},
            {name:"MBBS",institution:"DMC"},
            {name:"MBBS",institution:"DMC"},
            {name:"MBBS",institution:"DMC"}
        ]
     };
     const date='12 Jan 2024';
     const patient={
        name:"Md Rubayat",
        age:"22",
        gender:"Male",
        address:"Dhaka",
        weight:"56kg",
        bp:"90/120",
        history:"diabetes"
     }
     const medicines=[
        {name:"Pracetamol",distribution:"1-0-1",duration:"23days"},
        {name:"Gilmet",distribution:"1-1-1",duration:"30 days"},
        {name:"Chilipet",distribution:"1-0-0",duration:"15 days"},
        {name:"Chilipet",distribution:"1-0-0",duration:"15 days"},
        {name:"Chilipet",distribution:"1-0-0",duration:"15 days"},
        {name:"Chilipet",distribution:"1-0-0",duration:"15 days"},
        {name:"Chilipet",distribution:"1-0-0",duration:"15 days"},
        {name:"Chilipet",distribution:"1-0-0",duration:"15 days"},
        {name:"Chilipet",distribution:"1-0-0",duration:"15 days"},
        {name:"Chilipet",distribution:"1-0-0",duration:"15 days"}
     ];

     const tests=["X-ray","CBC","CT SCan"];
     res.render('pescription',{
        doctor,
        date,
        patient,medicines,tests
     });
});

const startServer = async () => {
    try {
        const connection = await db.getConnection();
        console.log("DB Successfully Connected...");
        app.listen(5000, () => {
            console.log('Server running on port 5000');
        });
    } catch (error) {
        console.log(error);
    }
}

startServer();


