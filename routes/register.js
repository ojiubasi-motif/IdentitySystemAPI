import express from "express";
import Registrant from "../models/Registeration.js";
import { v4 as uuidv4 } from "uuid";
import verify from "../middleware/verifyToken.js";
// import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";

const router = express.Router();
// register a user
router.post("/register", async (req, res) => {
  const {
    first_name,
    last_name,
    sex,
    other_names,
    birth_date,
    birth_city,
    birth_state,
    birth_country,
    mother_maiden_name,
    p_house_number,
    p_street,
    p_postal_code,
    p_city,
    p_state,
    p_landmark,
    r_house_number,
    r_street,
    r_postal_code,
    r_city,
    r_state,
    r_landmark,
    nationality,
    religion,
    m_first_name,
    m_last_name,
    f_first_name,
    f_last_name,
    state_of_origin,
    lg_of_origin,
    disable,
    disable_detail,
    level_of_education,
    marital_status,
    s_first_name,
    s_last_name,
    nok_first_name,
    nok_last_name,
    nok_relationship,
    nok_house_number,
    nok_street,
    nok_postal_code,
    nok_city,
    nok_state,
    nok_landmark,
    mobile,
    tel,
    email,
    convicted,
    occupation,
    emp_name,
    emp_tel,
    emp_house_number,
    emp_street,
    emp_postal_code,
    emp_city,
    emp_state,
    emp_landmark,
    blood_group,
    weight,
    height,
    hair_color,
    eye_color,
  } = req.body;

  const currdate = new Date();
  // const uuidSeed = "jdkdhekeksmdk";
  const reference = "" + Math.floor(Math.random() * 1000000 + 1);
 
  const newUser = new Registrant({
    nin: uuidv4(),
    name: {
      first_name,
      last_name,
      other_names,
    },
    sex,
    birth_data: {
      date: currdate.getFullYear(),
      city: birth_city,
      state: birth_state,
      country: birth_country,
    },
    mother_maiden_name,
    residential_address: {
      house_number: r_house_number,
      street: r_street,
      postal_code: r_postal_code,
      city: r_city,
      state: r_state,
      landmark: r_landmark,
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
    mother: {
      first_name: m_first_name,
      last_name: m_last_name,
    },
    father: {
      first_name: f_first_name,
      last_name: f_last_name,
    },
    state_of_origin,
    lg_of_origin,
    disabilities: {
      available: disable,
      details: disable_detail,
    },
    level_of_education,
    marital_status,
    spouse_name: {
      first_name: s_first_name,
      last_name: s_last_name,
    },
    next_of_kin: {
      first_name: nok_first_name,
      last_name: nok_last_name,
      address: {
        house_number: nok_house_number,
        street: nok_street,
        postal_code: nok_postal_code,
        city: nok_city,
        state: nok_state,
        landmark: nok_landmark,
      },
      relationship: nok_relationship,
    },
    contact: {
      mobile,
      tel,
      email,
    },
    convicted,
    occupation,
    employer: {
      name: emp_name,
      address: {
        house_number: emp_house_number,
        street: emp_street,
        postal_code: emp_postal_code,
        city: emp_city,
        state: emp_state,
        landmark: emp_landmark,
      },
      tel: emp_tel,
    },
    physical_exam: {
      blood_group,
      weight,
      height,
      eye_color,
      hair_color,
    },
  });

  try {
    const user = await newUser.save();
    const { nin: registeredNin, ...data } = user._doc;
    res.status(201).json({ registeredNin });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // check the kind of input supplied by the user for login
    const userData = await Registrant.findOne({'contact.email':email});
    if (!userData) {
      res.status(401).json("wrong credentials, no user with this email is found");
    } else {
     
      const originalPw = "12345";

      if (originalPw !== password) {
        res.status(401).json("wrong password, check your password. it must be '12345'");
      } else {
        // send a unique secret token for loggedin user
        const accessToken = jwt.sign({id:userData?._id, mobile:userData?.contact?.mobile},process.env.PW_CRYPT,{expiresIn:"1d"})
        //do not include the password when sending query response
        const { password: dbPword, ...data } = userData._doc;
        res.status(200).json({...data, accessToken});
      }
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// update the user record, be it password or another data
router.put("/:id", verify, async (req, res) => {
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
    if(req.body?.contact?.email){
      res.status(403).json("you cannot edit your email, contact admin")
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
    res.status(403).json("you can update only your account");
  }
});

// delete a record
router.delete("/:id", verify, async (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    // if it's not the password being updated, then continue with the try/catch
    try {
      await Registrant.findByIdAndDelete(req.params.id); //{new:true} returns the newly updated record
      res.status(200).json("user has been deleted");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("you can delete only your account");
  }
});

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
  if (req?.user?.mobile) {
    try { 
      // if there's query to return new users, return only the latest 2 registered else return all
      const user =query? await Registrant.find().sort({_id:-1}).limit(2): await Registrant.find(); 
      res.status(200).json(user);
    } catch (error) { 
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("you are not authorised to access this route, please register and/or log in with email=>[registeredEmail], password:==>>'12345'")
  }
});

// get registrants stats
router.get("/stats", async(req, res)=>{
  // let's find total users per month
  try {
    const data = await Registrant.aggregate([
      {
        $project:{
          monthlyStats:{$month: "$createdAt"}
        }
      },
      {
        $group:{
          _id: "$monthlyStats",
          total:{$sum:1}//return the total users per month
        }
      }
    ]);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error)
  }
})

export default router;