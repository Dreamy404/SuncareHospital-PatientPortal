const asyncHandler = require('../middleware/async');
const { getConnection } = require('../middleware/database');

//@desc    Add A Review
//@route   POST /review/add
//@access  Private

exports.addReview = asyncHandler(async (req, res, next) => {
      const userId = req?.user?.user_id;
      const comment = req?.body?.comment;
      const rating = req?.body?.rating;

      if (!userId || !comment || !rating) {
            //console.log('in add review');
            return res.status(400).json({ success: false, msg: "Parameters Missing" });
      }
      try {
            const connection = await getConnection();
            const [result] = await connection.execute('CALL ADD_REVIEW(?,?,?)', [userId, comment, rating]);

            if (result?.affectedRows > 0) {
                  return res.status(200).json({ success: true, msg: "Succesfully added review" });
            }
      } catch (error) {
            //console.log(error);
            return res.status(500).json({ success: false, msg: 'Internal server Error!' });
      }
});



//@desc    Get All Reviews(Some Indeed Cause All can't be shown)
//@route   GET /review/all
//@access  Public

exports.getReview = asyncHandler(async (req, res, next) => {
      const user_id = req?.params?.id || null;
      try {
            const connection = await getConnection();

            const [rows] = await connection.execute('CALL GET_RANDOM_REVIEWS(?)', [user_id]);
            if (rows[0].length > 0) {
                  return res.status(200).json(rows[0]);
            }
            return res.status(200).json([]);
      } catch (error) {
        return res.status(500).json({success:false,msg:"Internal server Error!"});
      }
});
