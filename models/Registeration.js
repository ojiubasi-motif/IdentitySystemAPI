import mongoose from "mongoose";

const RegisterationSchema = new mongoose.Schema(
  {
    nin:{type: String, required: true},
    name: {
      first_name: { type: String, required: true, maxlength: 200 },
      last_name: { type: String, required: true, maxlength: 200 },
      other_names: { type: String, maxlength: 200 },
    },
    sex: { type: String, required: true, maxlength: 50 },
    birth_data: {
      date: { type: Date, required: true, default: Date.now() },
      city: { type: String, required: true, maxlength: 200 },
      state: { type: String, required: true, maxlength: 200 },
      country: { type: String, required: true, maxlength: 200 },
    },
    mother_maiden_name: { type: String, maxlength: 200 },
    residential_address: {
      house_number: { type: Number, maxlength: 200 },
      street: { type: String, required: true },
      postal_code: { type: String, maxlength: 200 },
      city: { type: String, required: true, maxlength: 200 },
      state: { type: String, required: true, maxlength: 200 },
      landmark: { type: String, required: true },
    },
    permanent_address: {
      house_number: { type: Number, maxlength: 200 },
      street: { type: String, required: true },
      postal_code: { type: String, maxlength: 200 },
      city: { type: String, required: true, maxlength: 200 },
      state: { type: String, required: true, maxlength: 200 },
      landmark: { type: String, required: true },
    },
    nationality: { type: String, required: true, maxlength: 200 },
    religion: { type: String, required: true, maxlength: 200 },
    mother: {
      first_name: { type: String, required: true, maxlength: 200 },
      last_name: { type: String, required: true, maxlength: 200 },
    },
    father: {
      first_name: { type: String, required: true, maxlength: 200 },
      last_name: { type: String, required: true, maxlength: 200 },
    },
    state_of_origin: { type: String, required: true, maxlength: 200 },
    lg_of_origin: { type: String, required: true, maxlength: 200 },
    disabilities: {
      available: { type: Boolean, required: true, default: false },
      details: { type: String, maxlength: 200 },
    },
    level_of_education: { type: String, required: true, maxlength: 200 },
    marital_status: { type: String, required: true, maxlength: 200 },
    spouse_name: {
      first_name: { type: String, maxlength: 200 },
      last_name: { type: String, maxlength: 200 },
    },
    next_of_kin: {
      first_name: { type: String, maxlength: 200 },
      last_name: { type: String, maxlength: 200 },
      address: {
        house_number: { type: Number, maxlength: 200 },
        street: { type: String },
        postal_code: { type: String, maxlength: 200 },
        city: { type: String, maxlength: 200 },
        state: { type: String, maxlength: 200 },
        landmark: { type: String },
      },
      relationship: { type: String, maxlength: 200 },
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
    convicted: { type: Boolean, required: true, default: false },
    occupation: { type: String, required: true, maxlength: 200 },
    employer: {
      name: { type: String, maxlength: 200 },
      address: {
        house_number: { type: Number, maxlength: 200 },
        street: { type: String },
        postal_code: { type: String, maxlength: 200 },
        city: { type: String, maxlength: 50 },
        state: { type: String, maxlength: 50 },
        landmark: { type: String },
      },
      tel: { type: String, maxlength: 50 },
    },
    physical_exam: {
      blood_group: { type: String, required: true, maxlength: 50 },
      weight: { type: Number, required: true, maxlength: 10, default: 0 },
      height: { type: Number, required: true, maxlength: 10, default: 0 },
      eye_color: { type: String, required: true, maxlength: 50 },
      hair_color: { type: String, required: true, maxlength: 50 },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Registeration ||
  mongoose.model("Registeration", RegisterationSchema);
