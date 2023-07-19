import mongoose from "mongoose";

const RegisterationSchema = new mongoose.Schema(
  {
    nin: { type: String, required: true },
    bvn: { type: String },
    tin: { type: String },
    name: {
      first_name: { type: String, required: true },
      last_name: { type: String, required: true },
      other_names: { type: String },
    },
    sex: {
      type: String,
      enum: ["MALE", "FEMALE"],
      uppercase: true,
      required: true,
    },
    birth_certificate_id: { type: String },
    date_of_birth: { type: Date, required: true },
    medical:{
      blood_group: { type: String },
      genotype: { type: String },
      weight: { type: Number },
      height: { type: Number },
    },   
    mother_maiden_name: { type: String },
    residential_address: {
      utility_bill_type: {
        type: String,
        enum: ["electricity", "water", "sanitation"],
        required: true,
      },
      bill_number: { type: String, required: true },
    },
    permanent_address: {
      house_number: { type: Number },
      street: { type: String, required: true },
      postal_code: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      landmark: { type: String, required: true },
    },
    nationality: { type: String, required: true },
    religion: { type: String, required: true },
    state_of_origin: { type: String, required: true },
    lga: { type: String, required: true },
    disabilities: {
      status: { type: Boolean, required: true, default: false },
      details: { type: Array },
    },
    level_of_education: {
      type: String,
      enum: ["TERTIARY", "O'LEVEL", "PRIMARY", "SKILL", "NONE"],
      required: true,
    },
    marital_status: {
      type: String,
      enum: ["SINGLE", "MARRIED", "SEPARATED", "DIVORCED", "WIDOWED"],
      uppercase: true,
      required: true,
    },
    company_reg_no: { type: String },
    occupation: {
      type: String,
      enum: ["UNEMPLOYED", "STUDENT", "BUSINESS", "EMPLOYED", "SELF-EMPLOYED"],
      required: true,
    },
    marital_cert_no: { type: String },
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
      title: { type: String },
      relationship: { type: String },
      phone: { type: String },
      email: { type: String },
    },
    contact: {
      mobile: {
        type: String,
        required: true,
        unique: true,
      },
      tel: {
        type: String,
        maxlength: 200,
      },
      email: {
        type: String,
        unique: true,
      },
    },
    is_convicted: { type: Boolean, default: false },
    is_improsioned: { type: Boolean, default: false },
    is_deceased: { type: Boolean,  default: false },
    registered_by:{email:{type:String,required:true}},
    updated_by:[{ email: String, date: Date }]
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Registeration ||
  mongoose.model("registerations", RegisterationSchema);
