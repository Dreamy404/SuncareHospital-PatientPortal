const asyncHandler = require("./async");
const jwt = require('jsonwebtoken');
const { getConnection } = require("./database");

exports.protect = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies['refreshToken'];


    if (!refreshToken) {
       return  res.status(401).json({ msg: "Login Please!1" });
    }

    try {
        const connection = await getConnection();

        const [rows] = await connection.execute("SELECT refresh_token FROM BLOCKED_REFRESH_TOKEN WHERE refresh_token=?", [refreshToken]);

        if (rows.length > 0) {
            return res.status(401).json({ msg: "Login Please!2" });
        }
    } catch (error) {
        return res.status(400).json({ msg: "Internal Server Error!Try Later." });
    }

    const authHeader = req.headers['authorization'];

    if (!authHeader) return res.status(401).json({ msg: "Access Token Not Found!" });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ msg: "Inavalid Token!" });
        const { user } = decoded;
        req.user={...user};
        //console.log(user);
        next();
    });

});