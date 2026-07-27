import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
{
    clinic:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Clinic",
        required:true
    },

    medicineCode:{
        type:String,
        unique:true,
        required:true
    },

    medicineName:{
        type:String,
        required:true,
        trim:true
    },

    genericName:String,

    brand:String,

    category:{
        type:String,
        enum:[
            "TABLET",
            "CAPSULE",
            "SYRUP",
            "POWDER",
            "OIL",
            "LEHYAM",
            "CHOORNA",
            "GHRITA",
            "VATI",
            "OTHER"
        ]
    },

    manufacturer:String,

    unit:{
        type:String,
        default:"Piece"
    },

    purchasePrice:Number,

    sellingPrice:Number,

    gst:{
        type:Number,
        default:0
    },

    currentStock:{
        type:Number,
        default:0
    },

    minimumStock:{
        type:Number,
        default:10
    },

    isActive:{
        type:Boolean,
        default:true
    }

},
{
    timestamps:true
});

export default mongoose.model("Medicine",medicineSchema);