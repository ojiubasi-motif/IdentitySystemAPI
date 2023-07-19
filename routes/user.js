import express from "express";
import Registrant from "../models/Registeration.js";
import Auth from "../models/Auth.js";
import { v4 as uuidv4 } from "uuid";
import verify from "../middleware/verifyToken.js";
import CryptoJS from "crypto-js";

const router = express.Router();

// register a user
router.post("/users", async (req, res) => {
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

router.post("/users/complete-registration", verify, async (req, res) => {
  const {
    sex,
    bvn,
    tin,
    other_names,
    date_of_birth,
    mother_maiden_name,
    house_number,
    street,
    postal_code,
    city,
    state,
    landmark,
    nationality,
    religion,
    mother_first_name,
    mother_last_name,
    mother_nationality,
    father_first_name,
    father_last_name,
    father_nationality,
    state_of_origin,
    lga,
    disability_status,
    disability_details,
    level_of_education,
    marital_status,
    next_of_kin_first_name,
    next_of_kin_last_name,
    next_of_kin_relationship,
    next_of_kin_title,
    next_of_kin_phone,
    next_of_kin_email,
    tel,
    is_convicted,
    is_deceased,
    is_improsioned,
    occupation,
    weight,
    height,
    genotype,
    blood_group,
    utility_bill_type,
    bill_number,
    birth_certificate_id,
    company_reg_no,
    marital_cert_no,
  } = req.body;
  const {
    email: verifiedEmail,
    phone: verifiedPhone,
    first_name: verifiedFirstName,
    last_name: verifiedLAstName,
  } = req.user;

  // const bvn = "" + Math.floor(Math.random() * 10000000 + 1);
  const newUser = new Registrant({
    nin: uuidv4(),
    bvn,
    tin,
    name: {
      first_name: verifiedFirstName,
      last_name: verifiedLAstName,
      other_names,
    },
    sex,
    birth_certificate_id,
    date_of_birth,
    medical: {
      blood_group,
      genotype,
      weight,
      height,
    },
    mother_maiden_name,
    residential_address: {
      utility_bill_type,
      bill_number,
    },
    permanent_address: {
      house_number,
      street,
      postal_code,
      city,
      state,
      landmark,
    },
    nationality,
    religion,
    state_of_origin,
    lga,
    disabilities: {
      status: disability_status,
      details: disability_details,
    },
    level_of_education,
    marital_status,
    company_reg_no,
    occupation,
    marital_cert_no,
    mother: {
      first_name: mother_first_name,
      last_name: mother_last_name,
      maiden_name: mother_maiden_name,
      nationality: mother_nationality,
    },
    father: {
      first_name: father_first_name,
      last_name: father_last_name,
      nationality: father_nationality,
    },
    next_of_kin: {
      first_name: next_of_kin_first_name,
      last_name: next_of_kin_last_name,
      title: next_of_kin_title,
      relationship: next_of_kin_relationship,
      phone: next_of_kin_phone,
      email: next_of_kin_email,
    },
    contact: {
      mobile: verifiedPhone,
      tel,
      email: verifiedEmail,
    },
    is_convicted,
    is_improsioned,
    is_deceased,
    registered_by:{email:verifiedEmail}
  });
  const phoneHasRegistered = Registrant.findOne(
    { "contact.mobile": verifiedPhone },
    "contact.mobile"
  );
  const emailHasRegistered = Registrant.findOne(
    { "contact.mobile": verifiedPhone },
    "contact.mobile"
  );
  try {
    if (
      (await phoneHasRegistered.exec()) !== null ||
      (await emailHasRegistered.exec()) !== null
    ) {
      return res.status(403).json("this user has done registration");
    }
    const user = await newUser.save().select("nin");
    // const { nin: registeredNin, ...data } = user._doc;
    res.status(201).json({ registeredNin:user});
  } catch (err) {
    res.status(500).json(err);
  }
});

// update the user record, be it password or another data
router.put("/users/:id", verify, async (req, res) => {
  // only the owner of the record(loggedin user) or the admin can update the record for that user
  const searchUser = await Registrant.findById(req.params?.id, "_id, contact");
  if (!searchUser) {
    return res.status(403).json("user not found");
  }

  if (
    (req.user?.email === searchUser?.contact?.email &&
      req.user?.phone === searchUser?.contact?.mobile)
  ) {
    // check if it's password that's being changed and encrypt it accordingly
    // if (req.body.password) {
    //   req.body.password = CryptoJS.AES.encrypt(
    //     req.body.password,
    //     process.env.PW_CRYPT
    //   ).toString();
    // }
    // if it's not the password being updated, then continue with the try/catch
    // check if user wants to update email
    if (req.body?.contact) {
      res
        .status(403)
        .json(
          "you are not authorized to edit your email and/or phone, please contact the admin"
        );
    } else {
      try {
        const updateUser = await Registrant.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true }
        )//{new:true} returns the newly updated record
        
        updateUser !== null
          ? res.status(200).json(updateUser)
          : res.status(503).json("update was not successful");
      } catch (error) {
        res.status(500).json(error);
      }
    }
  } else {
    res.status(403).json("you are not authorized to modify this account");
  }
});

// get a user record
router.get("/users/:id/info", verify, async (req, res) => {
  try {
    const {
      email: verifiedEmail,
      phone: verifiedPhone,
      ...otherDetails
    } = req.user;

    const searchUser = await Registrant.findById(
      req.params?.id,
      "_id, contact"
    );
    if (!searchUser) {
      return res.status(403).json("user not found");
    }
    if (
      (verifiedEmail === searchUser?.contact?.email &&
        verifiedPhone === searchUser?.contact?.mobile) ||
      req.user?.isAdmin
    ) {
      const user = await Registrant.findById(req.params.id).select("-password");
      res.status(200).json(user);
    } else {
      res
        .status(403)
        .json("you are not authorised to fetch another user's record");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;