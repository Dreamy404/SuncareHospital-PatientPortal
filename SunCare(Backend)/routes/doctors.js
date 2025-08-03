const express=require('express');
const router=express.Router();


const{
  getDoctors,
  searchDoctors,
  getNextSevenDays,
  getTimeSchedule,
  searchDoctorsCnt,
  getDoctor
}=require('../controllers/doctors');


router.get('/',getDoctors);
router.get('/search',searchDoctors);
router.get('/search/count',searchDoctorsCnt);
router.get('/nextschedule',getNextSevenDays);
router.get('/timeschedule',getTimeSchedule);
router.get('/:id',getDoctor);


module.exports=router;