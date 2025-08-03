const express=require('express');
const router=express.Router();

const{
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updatePassword,
    getAccessToken
}=require('../controllers/auth');

const {protect}=require('../middleware/auth');

router.post('/register',register);
router.post('/newaccesstoken',getAccessToken);
router.post('/login',login);
router.post('/logout',protect,logout);
router.put('/updatepassword',protect,updatePassword);
router.post('/forgotpassowrd',forgotPassword);
router.put('/resetpassword/:resettoken',resetPassword);

module.exports=router;