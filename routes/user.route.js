import express, { json } from 'express'
import hashedPassword from '../hashedPassword.js';
import { getUserByEmail, isTokenVerified, userSignup } from '../services/user.services.js';
import sendEmail from '../services/sendEmail.js';
import { client } from '../index.js';
import { generateToken } from '../services/generateToken.js';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
// import verifyToken from '../middleware/verifyToken.js';
import nodemailer from 'nodemailer';

const router = express.Router();
// Register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    console.log(email);
    const userFromDB = await getUserByEmail(email)
    if (userFromDB) {
        res.send({ message: "Email already Exist" })
    } else if (password.length < 8) {
        res.status(400).send({ message: "Password must be at least 8 characters" })
    } else {
        const finalHash = await hashedPassword(password)
        // const result = {
        //     name,
        //     email,
        //     password: finalHash
        // }

        const db_res = await userSignup(username, email, finalHash);
        res.send(db_res);
    }
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const userFromDB = await getUserByEmail(email)
    // console.log(userFromDB);
    if (!userFromDB) {
        res.status(401).send({ message: "Invalid Credentials" })
    } else {
        //!Compare Hashed Password
        const storedPassword = userFromDB.password;
        const isPasswordMatch = await bcrypt.compare(password, storedPassword);
        //!Token Generation
        const { token } = await generateToken(userFromDB);

        if (isPasswordMatch) {
            await client
                .db('moneyManagerDup')
                .collection('income/expenses')
                .updateOne({ _id: userFromDB._id }, { $set: { token: token } });

            res.send({ message: "Login Successfully", token: token, userFromDB })
        } else {
            res.status(401).send({ message: "Invalid Credentials" })
        }
    }
})

router.post('/sendemail', async (req, res) => {
    sendEmail(res);
})

// router.get('/reset-auth', verifyToken, (req, res) => {
//     res.json({ message: `welcome ${req.user.email} this is Protected Data` })
// })

router.post("/loginhelp", async (req, res) => {
    const { email } = req.body;
    const user = await getUserByEmail(email)

    if (!user) res.status(404).json({ message: "Not Found" });

    const otpToken = await Math.random().toString(36).slice(-6);
    user.token = otpToken;
    user.expiresIn = Date.now() + 3600000 //1 hour
    // await user.save();
    sendEmail(user, otpToken, res);
    await client
        .db('moneyManagerDup')
        .collection('income/expenses')
        .updateOne({ email: email }, { $set: { resetPasswordToken: otpToken, expiresIn: user.expiresIn } })
    // console.log(user);

})

router.post("/loginhelp/tokenauth/:token", async (req, res) => {
    const { token } = req.params;
    console.log(token);
    //!Checking token is valid or Not
    try {
        const user = await isTokenVerified(token);
        // console.log(user);
        if (!user) {
            res.status(404).json({ message: "Invalid Token" })
        } else {
            res.status(200).json({ message: "Verified" })
            // console.log("Verified");
            // console.log(user);
        }


    } catch (error) {
        console.log(error);
        console.log(error.stack);
    }

})

router.post("/loginhelp/resetpassword", async (req, res) => {
    // const { token } = req.params;
    const { password } = req.body;
    // console.log(token);
    //!Checking token is valid or Not
    const user = await client
        .db("moneyManagerDup")
        .collection("income/expenses")
        .findOne(
            {
                expiresIn: { $gt: Date.now() },
            });
    if (!user) res.status(404).json({ message: "Invalid Token" })
    // console.log(user);

    //!Comparing Password
    const updatedPassword = await hashedPassword(password)
    const storedPassword = user.password;

    const isPasswordMatch = await bcrypt.compare(password, storedPassword);
    // console.log(isPasswordMatch);
    if (!isPasswordMatch) {
        await client
            .db('moneyManagerDup')
            .collection('income/expenses')
            .updateOne({ email: user.email }, { $set: { password: updatedPassword, resetPasswordToken: "", expiresIn: null } })

        res.json({ message: "Password Changed Successfully" })
        console.log("Password changed successfully");
    }
    else {
        res.json({ message: "Try Diff password" })
    }

})


export default router;




