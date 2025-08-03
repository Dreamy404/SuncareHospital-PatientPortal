const asyncHandler = require("../middleware/async");
const bcrypt = require('bcryptjs');
const { getConnection } = require('../middleware/database');
const jwt = require('jsonwebtoken');

//@desc    Register User
//@route   POST /suncarehospital/auth/register
//@access  Public

exports.register = asyncHandler(async (req, res, next) => {
    let { name, year, month, day, gender, phone, email, address, username, password } = req.body;
    phone = phone ? phone : null;
    email = email ? email : null;
    address = address ? address : null;


    if (name && year && month && day && gender && username && password) {
        try {
            const connection = await getConnection();
            const saltRound = 10;
            const hashedPassword = await bcrypt.hash(password, saltRound);

            const response = await connection.execute('CALL CREATE_PATIENT_WITH_USER(?,?,?,?,?,?,?,?,?,?)', [name, gender, year, month, day, username, hashedPassword, address, email, phone]);

            sendTokenResponse(username, res, "You are successfully Registered!");
        } catch (error) {
            console.log(error);
            res.status(400).json({ loggedIn: false, msg: error.sqlMessage });
        }

    } else {
        res.status(401).json({ loogedIn: false, msg: "Your Information is missing!" });
    }
});


//@desc    Login User
//@route   POST /suncarehospital/auth/login
//@access  Public

exports.login = asyncHandler(async (req, res, next) => {
    const { username, password } = req.body;

    if (username && password) {
        try {
            const connection = await getConnection();

            const [rows] = await connection.execute('SELECT password_hash FROM USER WHERE username=?', [username]);

            if (rows.length < 1) {
                return res.status(401).json({ loggedIn: false, msg: "No such user!" });
            } else {
                const { password_hash } = rows[0];
                const match = await bcrypt.compare(password, password_hash);

                if (match) {
                    sendTokenResponse(username, res, "You are succesfuuly Logged in!");
                } else {
                    return res.status(401).json({ loggedIn: false, msg: "Invalid Credentials" });
                }
            }
        } catch (error) {
            console.log(error);
            return res.status(400).json({ loggedIn: false, msg: "Internal Error" });
        }

    } else {
        return res.status(401).json({ loggedIn: false, msg: "Your Creddential is missing" });
    }
});

//@desc   Renew Access Token
//@route  POST /suncarehospital/auth/newaccesstoken
//@access Public
exports.getAccessToken = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
        return res.status(401).json({ loggedIn: false, msg: "Missing Refersh Token" });
    }

    try {
        const connection = await getConnection();

        const [rows] = await connection.execute("SELECT refresh_token FROM BLOCKED_REFRESH_TOKEN WHERE refresh_token=?", [refreshToken]);

        if (rows.length > 0) {
            return res.status(401).json({ loggedIn: false, msg: "Login Please!" });
        }
    } catch (error) {
        return res.status(400).json({ loggedIn: false, msg: "Internal Server Error!Try Later." });
    }

    //validated to have correct refresh token
    const refreshSecretKey = process.env.JWT_REFRESH_SECRET_KEY;
    jwt.verify(refreshToken, refreshSecretKey, async (err, decoded) => {
        if (err) return res.satus(401).json({ loggedIn: false, msg: "Unauthorized! PLease Login Again" });

        const { user } = decoded;
        const accessSecretKey = process.env.JWT_ACCESS_SECRET_KEY;

        const accessToken = jwt.sign({ user: user }, accessSecretKey, { expiresIn: '15m' });
        res.status(200).json({ loggedIn: true, user, accessToken: accessToken, msg: "Succesfully Logged in" });
    })

});


//@desc    Register User
//@route   POST /suncarehospital/auth/logout
//@access  Private

exports.logout = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
        return res.satus(401).json({ msg: "Unauthorized Access!" });
    }
    try {
        const connection = await getConnection();

        await connection.execute('INSERT INTO BLOCKED_REFRESH_TOKEN (REFRESH_TOKEN) VALUES(?)', [refreshToken])

        res.status(200).json({ loggedIn: false, accessToken: "", msg: "Logout Successful" });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ msg: "Internal Error!" });
    }
});


//@desc    Forgot Password
//@route   POST /suncarehospital/auth/forgotpassword
//@access  Public

exports.forgotPassword = asyncHandler(async (req, res, next) => {

});


//@desc    Reset Password
//@route   PUT /suncarehospital/auth/resetpassword
//@access  Public

exports.resetPassword = asyncHandler(async (req, res, next) => {

});


//@desc    Update Password
//@route   PUT /suncarehospital/auth/updatepassword
//@access  Public

exports.updatePassword = asyncHandler(async (req, res, next) => {
    res.send('Success');
});


//@desc    Issues Refresh Token and Access Token initially
//@route   
//@access  Private (only after login in some way)
const sendTokenResponse = async (username, res, msg) => {
    const refreshSecretKey = process.env.JWT_REFRESH_SECRET_KEY;
    const accessSecretKey = process.env.JWT_ACCESS_SECRET_KEY;

    try {
        const connection = await getConnection();

        const [rows] = await connection.execute('CALL GET_USER_DATA(?)', [username]);
        const [user] = rows[0];

        const accessToken = jwt.sign({ user: user }, accessSecretKey, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ user: user }, refreshSecretKey, { expiresIn: '7d' });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'Lax',
            secure: false,
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ loggedIn: true, user, accessToken: accessToken, msg: msg });

    } catch (error) {
        return res.satus(500).json({ loggedIn: false, msg: "Internal Error!" });
    }
}


