const express=require("express");
const router=express.Router();

const {protect}=require('../middleware/auth');



const {
    getReview,
    addReview
}=require('../controllers/review');


router.post('/add',protect,addReview);
router.get('/all',getReview);
router.get('/all/:id',getReview);


module.exports=router;