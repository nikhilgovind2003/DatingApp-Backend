import mongoose, { Schema } from "mongoose";

const employementSchema=new Schema({
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName:{
        type:String
    },
    designation:{
        type:String
    },
    employement:{
        type:String,
    },
    location:{
        type:String
    },
    level:{
        type:String
    },
    title: {
        type: String,
    }
    },
    {
    timestamps: true,
     }
    )

const EmployementModel = new mongoose.model('Employement',employementSchema);
export default EmployementModel