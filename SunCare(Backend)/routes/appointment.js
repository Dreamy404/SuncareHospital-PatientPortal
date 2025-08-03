const express=require('express');
const router=express.Router();



const {
  bookAppointment,
  getAppointments,
  cancelAppointment,
  updateAppointment
}=require('../controllers/appointment');
const { protect } = require('../middleware/auth');


router.post('/book',protect,bookAppointment);
router.get('/appointments',protect,getAppointments);
router.put('/cancel/:id',protect,cancelAppointment);
router.put('/update/:id',protect,updateAppointment);



module.exports=router;