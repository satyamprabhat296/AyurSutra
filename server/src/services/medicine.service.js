import Medicine from "../models/medicine.model.js";

export const generateMedicineCode = async () => {

    const last = await Medicine.findOne()
    .sort({createdAt:-1})
    .select("medicineCode");

    let number=1;

    if(last){

        number=Number(last.medicineCode.split("-")[1])+1;

    }

    return `MED-${String(number).padStart(6,"0")}`;

};