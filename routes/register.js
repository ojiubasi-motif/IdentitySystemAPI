import express from "express";
import Registrant from "../models/Registeration.js";
import Auth from "../models/Auth.js";
import { v4 as uuidv4 } from "uuid";
import verify from "../middleware/verifyToken.js";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";

const router = express.Router();
// register a user

router.post("/signup", async (req, res) => {
  const { email, phone, first_name, last_name, password } = req.body;

  if (!email || !phone || !first_name || !last_name) {
    res.status(403).json("please supply all the fields");
  } else {
    // if user didn't supply a password, generate one for him/her
    const initialPassword = "" + Math.floor(Math.random() * 10000 + 1);
    const newUser = new Auth({
      email,
      phone,
      first_name,
      last_name,
      password: CryptoJS.AES.encrypt(
        password ? password : initialPassword,
        process.env.PW_CRYPT
      ).toString(),
    });
    try {
      let emailAlreadyExist = await Auth.findOne({ email }, "email"); //return only the email field
      let phoneAlreadyExist = await Auth.findOne({ phone }, "phone"); //return only the phone field
      if (
        emailAlreadyExist?.email == email ||
        phoneAlreadyExist?.phone == phone
      ) {
        res
          .status(403)
          .json("A user with this email and/or phone already exist");
      } else {
        const savedUser = await newUser.save();
        const {
          password: savedPassword,
          createdAt,
          updatedAt,
          ...data
        } = savedUser._doc;
        res
          .status(201)
          .json({ data, password: !password ? initialPassword : null });
      }
    } catch (err) {
      console.log(err);
    }
  }
});

router.post("/register", verify, async (req, res) => {
  const {
    sex,
    other_names,
    birth_date,
    mother_maiden_name,
    p_house_number,
    p_street,
    p_postal_code,
    p_city,
    p_state,
    p_landmark,
    nationality,
    religion,
    m_first_name,
    m_last_name,
    mother_nationality,
    f_first_name,
    f_last_name,
    f_nationality,
    state_of_origin,
    lg_of_origin,
    disable,
    disable_detail,
    level_of_education,
    marital_status,
    nok_first_name,
    nok_last_name,
    nok_relationship,
    nok_title,
    tel,
    convicted,
    occupation,
    weight,
    height,
    utility_bill_type,
  } = req.body;
  const {
    email: verifiedEmail,
    phone: verifiedPhone,
    first_name: verifiedFirstName,
    last_name: verifiedLAstName,
  } = req.user;

  // console.log("verified user details==>", req.user);

  const currdate = new Date();
  const bvn = "" + Math.floor(Math.random() * 10000000 + 1);

  const newUser = new Registrant({
    nin: uuidv4(),
    bvn,
    name: {
      first_name: verifiedFirstName,
      last_name: verifiedLAstName,
      other_names,
    },
    sex,
    bio: {
      birth_certificate_id: `BC${bvn}`,
      date_of_birth: Date.now(),
      weight,
      height,
    },
    mother_maiden_name,
    residential_address: {
      utility_bill_type,
      bill_number: utility_bill_type ? `UB${bvn}` : null,
    },
    permanent_address: {
      house_number: p_house_number,
      street: p_street,
      postal_code: p_postal_code,
      city: p_city,
      state: p_state,
      landmark: p_landmark,
    },
    nationality,
    religion,
    state_of_origin,
    lg_of_origin,
    disabilities: {
      available: disable,
      details: disable_detail,
    },
    level_of_education,

    marital_status,
    marital_certificate_no: marital_status !== "SINGLE" ? `MC${bvn}` : null,
    mother: {
      first_name: m_first_name,
      last_name: m_last_name,
      maiden_name: mother_maiden_name,
      nationality: mother_nationality,
    },
    father: {
      first_name: f_first_name,
      last_name: f_last_name,
      nationality: f_nationality,
    },
    next_of_kin: {
      first_name: nok_first_name,
      last_name: nok_last_name,
      title: nok_title,
      relationship: nok_relationship,
    },
    contact: {
      mobile: verifiedPhone,
      tel,
      email: verifiedEmail,
    },
    social_status: {
      convicted,
      case_file_Id: convicted ? `CF${bvn}` : null,
    },
    occupation: {
      status: occupation,
      employer_CAC_num:
        occupation === "EMPLOYED" || occupation === "BUSINESS"
          ? `CAC${bvn}`
          : null,
      TIN: occupation === "SELF-EMPLOYED" ? `TIN${bvn}` : null,
    },
  });

  try {
    const userHasRegistered = await Registrant.findOne(
      { "contact.mobile": verifiedPhone },
      "contact.mobile"
    );
    if (userHasRegistered) {
      res.status(403).json("this user has done registration");
    }
    const user = await newUser.save();
    const { nin: registeredNin, ...data } = user._doc;
    res.status(201).json({ registeredNin });
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
        ? await Auth.findOne({ email: user })
        : await Auth.findOne({ phone: user });

    if (!userData) {
      res.status(401).json("no user found for this email/phone, signup first");
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
        const accessToken = jwt.sign(
          {
            first_name: userData?.first_name,
            last_name: userData?.last_name,
            email: userData?.email,
            phone: userData?.phone,
          },
          process.env.PW_CRYPT,
          { expiresIn: "1d" }
        );
        //do not include the password when sending query response
        const { password: dbPword, ...data } = userData._doc;
        res.status(200).json({ ...data, accessToken });
      }
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// update the user record, be it password or another data
router.put("/update/:id", verify, async (req, res) => {
  // only the owner of the record(loggedin user) or the admin can update the record for that user
  if (req.user.id === req.params.id || req.user.isAdmin) {
    // check if it's password that's being changed and encrypt it accordingly
    // if (req.body.password) {
    //   req.body.password = CryptoJS.AES.encrypt(
    //     req.body.password,
    //     process.env.PW_CRYPT
    //   ).toString();
    // }
    // if it's not the password being updated, then continue with the try/catch
    // check if user wants to update email
    if (req.body?.contact?.email) {
      res.status(403).json("you cannot edit your email, contact the admin");
    }

    try {
      const updateUser = await Registrant.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      ); //{new:true} returns the newly updated record
      res.status(200).json(updateUser);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("you are not authorized to modify this account");
  }
});

// delete a record
// router.delete("/:id", verify, async (req, res) => {
//   if (req.user.id === req.params.id || req.user.isAdmin) {
//     // if it's not the password being updated, then continue with the try/catch
//     try {
//       await Registrant.findByIdAndDelete(req.params.id); //{new:true} returns the newly updated record
//       res.status(200).json("user has been deleted");
//     } catch (error) {
//       res.status(500).json(error);
//     }
//   } else {
//     res.status(403).json("you can delete only your account");
//   }
// });

// get a user record
router.get("/find/:id", async (req, res) => {
  try {
    const user = await Registrant.findById(req.params.id); //{new:true} returns the newly updated record
    // const { password: userPw, ...data } = user._doc;
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get all users
router.get("/", verify, async (req, res) => {
  // check if route contains 'new' query i.e "/?new==true"
  const query = req.query.new;
  // you must be a logged in user in order to have access to this resource
  if (req?.user?.phone && req?.user?.email) {
    try {
      // if there's query to return new users, return only the latest 2 registered else return all
      const users = query
        ? await Registrant.find()
            .sort({ _id: -1 })
            .limit(10)
            .select("-password")
        : await Registrant.find();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res
      .status(403)
      .json(
        "you are not authorised to access this route, please register and/or log in with email=>[registeredEmail], password:==>>'12345'"
      );
  }
});

// get registrants stats
router.get("/stats", async (req, res) => {
  // let's find total users per month
  try {
    const data = await Registrant.aggregate([
      {
        $project: {
          monthlyStats: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$monthlyStats",
          total: { $sum: 1 }, //return the total users per month
        },
      },
    ]);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
