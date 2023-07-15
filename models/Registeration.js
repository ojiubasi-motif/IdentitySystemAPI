import mongoose from "mongoose";

const RegisterationSchema = new mongoose.Schema(
  {
    nin: { type: String, required: true },
    bvn: { type: String, required: true },
    name: {
      first_name: { type: String, required: true, maxlength: 200 },
      last_name: { type: String, required: true, maxlength: 200 },
      other_names: { type: String, maxlength: 200 },
    },
    sex: { type: String,enum:["MALE","FEMALE"],uppercase:true, required: true},
    bio: {
      birth_certificate_id:{type:String},
      date_of_birth: { type: Date, required: true, default: Date.now() },
      weight: { type: Number, required: true, maxlength: 10, default: 0 },
      height: { type: Number, required: true, maxlength: 10, default: 0 },
    },
    mother_maiden_name: { type: String, },
    residential_address: {
      utility_bill_type:{type:String, enum:["electricity","water","sanitation"], required:true},
      bill_number:{type:String, required:true}
    },
    permanent_address: {
      house_number: { type: Number, maxlength: 200 },
      street: { type: String, required: true },
      postal_code: { type: String, maxlength: 200 },
      city: { type: String, required: true, maxlength: 200 },
      state: { type: String, required: true, maxlength: 200 },
      landmark: { type: String, required: true },
    },
    nationality: { type: String, required: true,  },
    religion: { type: String, required: true,  },

    state_of_origin: { type: String, required: true,  },
    lg_of_origin: { type: String, required: true,  },
    disabilities: {
      available: { type: Boolean, required: true, default: false },
      details: { type: String,  },
    },
    level_of_education: { type: String,enum:["TERTIARY","O'LEVEL","PRIMARY","SKILL","NONE"], required: true,  },

    marital_status: {
      type: String,
      enum: ["SINGLE", "MARRIED", "SEPARATED", "DIVORCED", "WIDOWED"],
      uppercase: true,
      required:true
    },
    marital_certificate_no: { type: String },
    mother: {
      first_name: { type: String },
      last_name: { type: String },
      maiden_name: { type: String },
      nationality: { type: String },
    },
    father: {
      first_name: { type: String },
      last_name: { type: String },
      nationality: { type: String },
    },
    next_of_kin: {
      first_name: { type: String },
      last_name: { type: String },
      title: { type: String,enum:["Mr","Mrs","Miss","Ms","Chief","Prof"] },
      relationship: { type: String },
    },
    contact: {
      mobile: {
        type: String,
        required: true,
        maxlength: 200,
        unique: true,
      },
      tel: {
        type: String,
        maxlength: 200,
      },
      email: {
        type: String,
        maxlength: 200,
        unique: true,
      },
    },
    social_status: {
      convicted: { type: Boolean, required: true, default: false },
      case_file_Id: { type: String, },
    },
    occupation: {
      status:{type:String, enum:["UNEMPLOYED","STUDENT","BUSINESS","EMPLOYED","SELF-EMPLOYED"],required:true},
      employer_CAC_num: { type: String },
      TIN:{type:String}
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Registeration ||
  mongoose.model("Registeration", RegisterationSchema);
