import express from "express";
import Auth from "../models/Auth.js";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";

const router = express.Router();
// login===NB:you can login with either your email or phone
router.post("/auth/login", async (req, res) => {
  const { user, password } = req.body;
  try {
    // check the kind of input supplied by the user for login
    const userData =
      user.toString().search("@") >= 0
        ? await Auth.findOne({ email: user })
        : await Auth.findOne({ phone: user });
    if (!userData) {
      res.status(401).json({msg:"wrong login credentials, couldn't login",type:"NOT_EXIST",code:601});
    } else {
      const bytes = CryptoJS.AES.decrypt(
        userData.password,
        process.env.PW_CRYPT
      );
      const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

      if (originalPassword !== password) {
        res.status(401).json({msg:"wrong login credentials, couldn't login",type:"INVALID_CREDENTIAL",code:602});
      } else {
        
        // send a unique secret token for loggedin user
        const accessToken = jwt.sign(
          {
            id:userData?._id,
            first_name: userData?.first_name,
            last_name: userData?.last_name,
            email: userData?.email,
            phone: userData?.phone,
            is_admin:userData?.is_admin 
          },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );
        //do not include the password when sending query response
        const { password: dbPword, ...data } = userData._doc;
        res.status(200).json({ ...data, accessToken });
      }
    }
  } catch (err) {
    res.status(500).json({msg:err,type:"ACTION_UNSUCCESSFUL",code:603});
  }
});

export default router;