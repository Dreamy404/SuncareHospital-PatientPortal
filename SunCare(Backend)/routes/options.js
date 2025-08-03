const express=require('express');
const router=express.Router();


const {
    getSubjects,
    getDegrees,
    getDesignations,
    getDoctors,
    getServices
}=require('../controllers/options');



router.get('/subjects',getSubjects);
router.get('/designations',getDesignations);
router.get('/degrees',getDegrees);
router.get('/doctors',getDoctors);
router.get('/services',getServices);

module.exports=router;