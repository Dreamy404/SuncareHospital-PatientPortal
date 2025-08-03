const express=require('express');
const router=express.Router();
const multer=require('multer');
const storage=multer.memoryStorage();
const {protect}=require('../middleware/auth');
const {
    getPdf,
    getPrescriptions,
    getPrescription,
    getReports,
    uploadProfile,
    getProfile
}=require('../controllers/patient');

const upload=multer({storage});

router.get('/reports',protect,getReports);
router.get('/profile/:id',protect,getProfile);
router.post('/profile-upload',protect,upload.single('file'),uploadProfile);
router.get('/prescription/:id',protect,getPrescription);
router.get('/prescriptions',protect,getPrescriptions);
router.get('/pdf',getPdf);

module.exports=router;