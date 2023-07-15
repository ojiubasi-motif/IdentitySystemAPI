import express from "express";
import User from "../models/Auth.js";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";

const router = express.Router();

// signup
router.post("/signup", async (req, res) => {
  const { email, phone, password } = req.body;
  const newUser = new User({
    email,
    phone,
    password: CryptoJS.AES.encrypt(password, process.env.PW_CRYPT).toString(),
  });
  try {
    const user = await newUser.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json(err);
  } 
});

// login===NB:you can login with either your email or phone
router.post("/login", async (req, res) => {
  const { user, password } = req.body;
  try {
    // check the kind of input supplied by the user for login
    const userData =
      user.toString().search("@") >= 0
        ? await User.findOne({ email: user })
        : await User.findOne({ phone: user });

    if (!userData) {
      res.status(401).json("wrong login credentials, no user found");
    } else {
      const bytes = CryptoJS.AES.decrypt(
        userData.password,
        process.env.PW_CRYPT
      );
      const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

      if (originalPassword !== password) {
        res.status(401).json("wrong login credentials, couldn't login");
      } else {
        // send a unique secret token for loggedin user
        const accessToken = jwt.sign({id:userData?._id, isAdmin:userData?.isAdmin},process.env.PW_CRYPT,{expiresIn:"5d"})
        //do not include the password when sending query response
        const { password: dbPword, ...data } = userData._doc;
        res.status(200).json({...data, accessToken});
      }
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;