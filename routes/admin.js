import express from "express";
import Registrant from "../models/Registeration.js";
import { v4 as uuidv4 } from "uuid";
import verify from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/is-admin/users/registration", verify, async (req, res) => {
    console.log("the loggedin admin==>",req.user);
  if (!req?.user?.is_admin) {
    return res
      .status(403)
      .json("you are not authorised to access this resource");
  }
  const newDate = Date.now();
  const {
    sex,
    bvn,
    tin,
    first_name,
    last_name,
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
    email,
    mobile,
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
  //

  // const bvn = "" + Math.floor(Math.random() * 10000000 + 1);
  const newUser = new Registrant({
    nin: uuidv4(),
    bvn,
    tin,
    name: {
      first_name:first_name,
      last_name:last_name,
      other_names,
    },
    sex,
    birth_certificate_id,
    date_of_birth:newDate,
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
      mobile,
      tel,
      email,
    },
    registered_by: { email: req?.user?.email },
    is_convicted,
    is_improsioned,
    is_deceased,
  });
  const phoneHasRegistered = Registrant.findOne(
    { "contact.mobile": mobile },
    "contact.mobile"
  );
  const emailHasRegistered = Registrant.findOne(
    { "contact.mobile": email },
    "contact.mobile"
  );
  try {
    if (
      (await phoneHasRegistered.exec()) !== null ||
      (await emailHasRegistered.exec()) !== null
    ) {
      return res.status(403).json("this user has been registered");
    }
    const user = await newUser.save();
    const { nin: registeredNin, ...data } = user._doc;
    res.status(201).json({ nin: registeredNin });
  } catch (err) {
    res.status(500).json(err);
  }
});

// update the user record, be it password or another data
router.put("/is-admin/users/:id/", verify, async (req, res) => {
  if (!req?.user?.is_admin) {
    return res
      .status(403)
      .json("you are not authorised to access this resource");
  }
  // only the owner of the record(loggedin user) or the is-admin can update the record for that user
  const searchUser = await Registrant.findById(req.params?.id,);
  if (!searchUser) {
    return res.status(403).json("user not found");
  }

  try {
    // if (!req.body?.update?.email && !req.body?.update?.email)
    //   return res.status(503).json("you must supply the update fields");
    const updateUser = await Registrant.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    ); //{new:true} returns the newly updated record
    updateUser !== null
      ? res.status(200).json(updateUser)
      : res.status(503).json("your spec");
  } catch (error) {
    res.status(500).json(error);
  }
});

// delete a record
router.delete("/is-admin/users/:id/", verify, async (req, res) => {
  if (!req?.user?.is_admin) {
    return res
      .status(403)
      .json("you are not authorised to access this resource");
  }
  try {
    await Registrant.findByIdAndDelete(req.params.id); //{new:true} returns the newly updated record
    res.status(200).json("user has been deleted");
  } catch (error) {
    res.status(500).json(error);
  }
});

// get a user record
router.get("/is-admin/users/:id/info", verify, async (req, res) => {
  if (!req?.user?.is_admin) {
    return res
      .status(403)
      .json("you are not authorised to access this resource");
  }
  try {
    const searchUser = await Registrant.findById(req.params?.id, "-password");
    if (!searchUser) {
      return res.status(403).json("user not found");
    }
    const user = await Registrant.findById(req.params.id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get all users
router.get("/is-admin/users", verify, async (req, res) => {
  if (!req?.user?.is_admin) {
    return res
      .status(403)
      .json("you are not authorised to access this resource");
  }
  // check if route contains 'new' query i.e "/?new==true"
  const query = req.query.new;
  try {
    //if there's query to return new users, return only the latest 2 registered else return all
    const users = query
      ? await Registrant.find().sort({ _id: -1 }).limit(10).select("-password")
      : await Registrant.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get registrants stats
router.get("/users/stats", verify, async (req, res) => {
  // let's find total users per month
  if (!req?.user?.is_admin) {
    return res
      .status(403)
      .json("you are not authorised to access this resource");
  }
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
