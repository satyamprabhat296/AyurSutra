import Consultation from "../models/consultation.model.js";

export const createConsultation = async (req, res) => {
  try {

    const consultation = await Consultation.create({
      ...req.body,
      clinic: req.user.clinic,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Consultation created successfully",
      consultation,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
export const getConsultations = async (req, res) => {

  try {

    const consultations = await Consultation.find({
      clinic: req.user.clinic,
    })
      .populate("patient")
      .populate("doctor")
      .populate("appointment");

    res.status(200).json({
      success: true,
      total: consultations.length,
      consultations,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};


export const getConsultation = async (req, res) => {

  try {

    const consultation = await Consultation.findById(req.params.id)
      .populate("patient")
      .populate("doctor")
      .populate("appointment");

    if (!consultation) {

      return res.status(404).json({
        success: false,
        message: "Consultation not found",
      });

    }

    res.status(200).json({
      success: true,
      consultation,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};
export const updateConsultation = async (req, res) => {

  try {

    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Consultation updated",
      consultation,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};