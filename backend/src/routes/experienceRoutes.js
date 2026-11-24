import express from "express";
import mongoose from "mongoose";

import Experience from "../models/Experience.js";
import protect from "../middleware/auth.js";

const router = express.Router();

const allowedFields = [
  "company",
  "position",
  "employmentType",
  "location",
  "startDate",
  "endDate",
  "currentlyWorking",
  "description",
  "technologies",
  "order",
  "published",
];

const validateExperience = (data) => {
  return (
    typeof data.company === "string" &&
    data.company.trim().length > 0 &&
    typeof data.position === "string" &&
    data.position.trim().length > 0 &&
    typeof data.description === "string" &&
    data.description.trim().length > 0 &&
    data.startDate &&
    !Number.isNaN(Date.parse(data.startDate)) &&
    (data.technologies === undefined || Array.isArray(data.technologies))
  );
};

const pickAllowedFields = (body) => {
  const result = {};

  for (const field of allowedFields) {
    if (Object.hasOwn(body, field)) {
      result[field] = body[field];
    }
  }

  return result;
};

// Public: Get published experience
router.get("/", async (req, res) => {
  try {
    const experiences = await Experience.find({ published: true })
      .sort({ order: 1, startDate: -1 });

    res.status(200).json({
      success: true,
      count: experiences.length,
      experiences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch experience.",
    });
  }
});

// Admin: Get all experience entries
router.get("/admin/all", protect, async (req, res) => {
  try {
    const experiences = await Experience.find()
      .sort({ order: 1, startDate: -1 });

    res.status(200).json({
      success: true,
      count: experiences.length,
      experiences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch admin experience.",
    });
  }
});

// Admin: Create experience
router.post("/", protect, async (req, res) => {
  try {
    if (!validateExperience(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Company, position, description and valid startDate are required.",
      });
    }

    const experience = await Experience.create(
      pickAllowedFields(req.body)
    );

    res.status(201).json({
      success: true,
      message: "Experience created successfully.",
      experience,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Unable to create experience.",
    });
  }
});

// Admin: Update experience
router.put("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid experience ID.",
      });
    }

    const updates = pickAllowedFields(req.body);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    const experience = await Experience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found.",
      });
    }

    for (const [field, value] of Object.entries(updates)) {
      experience[field] = value;
    }

    await experience.save();

    res.status(200).json({
      success: true,
      message: "Experience updated successfully.",
      experience,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Unable to update experience.",
    });
  }
});

// Admin: Delete experience
router.delete("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid experience ID.",
      });
    }

    const experience = await Experience.findByIdAndDelete(req.params.id);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Experience deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete experience.",
    });
  }
});

export default router;
