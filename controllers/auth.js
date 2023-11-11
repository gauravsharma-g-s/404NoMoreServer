const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const UserOTPVerification = require("../model/UserOtpVerification");
const User = require('../model/User');

require('dotenv').config();

/* NODEMAILER CONFIGURATION */
const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
})


/*  SEND OTP VERIFICATION EMAIL */
const sendOTPVerificationEmail = async (req, res) => {
    try {
        const { firstName,
            lastName,
            email,
            password
        } = req.body;

        console.log("FirstName " + firstName + " LastName " + lastName + " Email " + email + " Password " + password)

        //console.log(req.body.get('email'))
        const hasAccount = await User.find({
            email
        });
        if (hasAccount.length >= 1) {
            //  records found
            throw new Error("409 Another user with this email exists!");
        }
        console.log("Creating OTP")
        /*  Generating OTP */
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

        // Mail Option
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Welcome to 404NoMore: Verify Your Email",
            html: `
        <div style="background-color: #f5f5f5; padding: 20px; font-family: Arial, sans-serif;">
            <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
                <h1 style="color: #333; text-align: center;">Welcome to 404NoMore</h1>
                <p style="color: #555; text-align: center;">Please verify your email address to get started.</p>
                <p style="color: #333; text-align: center; font-size: 24px;"><b>${otp}</b></p>
                <p style="color: #555; text-align: center;">Enter this code to complete the Sign-Up Process.</p>
                <p style="color: #555; text-align: center;">This code expires in <b>1 hour</b>.</p>
            </div>
        </div>
    `,
        };


        // Hash the Otp
        const salt = 10;
        const hashedOtp = await bcrypt.hash(otp, salt);
        console.log("Creating otp for " + email)
        const newOTPVerification = new UserOTPVerification({
            email: email,
            otp: hashedOtp,
            createdAt: Date.now(),
            expiredAt: Date.now() + 3600000
        });

        // save Otp record
        const saved = await newOTPVerification.save();
        console.log("Saved OTP")
        // Send the mail
        await transporter.sendMail(mailOptions);
        console.log("Otp sent")
        const otpId = saved._id;
        res.json({
            status: "PENDING",
            message: "Verification email sent",
            data: {
                firstName,
                lastName,
                email,
                password,
                otpId
            }
        })
    }
    catch (error) {
        res.status(400).json({
            status: "FAILED",
            message: error.message
        })
    }
}


/* REGISTER USER */
const register = async (req, res) => {
    let isAuthenticated = false;
    try {
        const {
            otpId,
            otp
        } = req.body;                                               // Destructure the req.body object and extract all values
        console.log(otpId, otp)
        // Verify User Otp
        if (!otpId || !otp) {
            throw new Error("400 Empty otp details are not allowed");
        } else {
            const UserOTPVerificationRecords = await UserOTPVerification.findById(otpId);
            console.log("userOtpverificationrecords", UserOTPVerificationRecords);
            if (!UserOTPVerificationRecords) {
                // no records found
                throw new Error("Account record not found. Signup again")
            } else {
                const { expiredAt } = UserOTPVerificationRecords;
                const hashedOtp = UserOTPVerificationRecords.otp;

                if (expiredAt < Date.now()) {
                    await UserOTPVerification.deleteMany({ _id: otpId });
                    throw new Error("Code has expired. Plaese request again")
                }
                else {
                    const validOTP = await bcrypt.compare(otp, hashedOtp);

                    if (!validOTP) {
                        // Supply OTP is wrong
                        throw new Error("401 Invalid OTP")
                    }
                    else {
                        await UserOTPVerification.deleteMany({ _id: otpId });
                        isAuthenticated = true;
                    }
                }
            }
        }

        // succesfull email authentication
        if (isAuthenticated === true) {
            const { firstName,
                lastName,
                email,
                password } = req.body;
            const salt = await bcrypt.genSalt();
            const passwordHash = await bcrypt.hash(password, salt);      // password encrption

            const newUser = new User({                                 // New User Details
                firstName,
                lastName,
                email,
                password: passwordHash
            });
            const savedUser = await newUser.save();
            console.log(savedUser, savedUser._doc)
            const successfullySavedUser = { ...savedUser._doc, error: "No error" }
            res.status(201).json(successfullySavedUser);            // Resource saved successfully and returned saved User to Front-End
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

/* LOGGING IN */
const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email: email })
        if (!user)
            return res.status(400).json({ msg: "User doesnot exists!" })
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(400).json({ msg: "Please check you password!" })

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { 'expiresIn': '1d' })                   // creating access Token
        delete user.password;
        res.status(200).json({ token, user })                                              // Returned Token and Userdetails
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

/* GET ALL USERS */
const getAllUsers = async (req, res) => {
    try {
        const allUsers = await User.find();
        res.status(200).json(allUsers);
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}

/* GET A USER */
const getUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        if (user) {
            res.status(200).json(user);
        }
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}

/* UPDATE USER DETAILS */
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { firstName, lastName, about, skills } = req.body;
        const updatedUserResponse = await User.findByIdAndUpdate(
            userId, {
            firstName,
            lastName,
            skills,
            about
        },
            {
                new: true
            }
        )
        if (!updatedUserResponse) res.status(404).json("User doesnt exists")
        res.status(200).json(updatedUserResponse);
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// ------ savedUser._doc

module.exports = { sendOTPVerificationEmail, register, login, getAllUsers, updateUser, getUser }