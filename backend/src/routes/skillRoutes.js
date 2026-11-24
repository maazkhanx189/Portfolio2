import express from "express";
import mongoose from "mongoose";

import Skill from "../models/Skill.js";
import protect from "../middleware/auth.js";

const router = express.Router();

const validSkillData = (data) => {
  return (
    typeof data.name === "string" &&
    data.name.trim().length > 0 &&
    typeof data.category === "string" &&
    data.category.trim().length > 0
  );
};

// Public: Get published skills
router.get("/", async (req, res) => {
  try {
    const skills = await Skill.find({ published: true })
      .sort({ order: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch skills.",
    });
  }
});

// Admin: Get all skills, including unpublished
router.get("/admin/all", protect, async (req, res) => {
  try {
    const skills = await Skill.find().sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch admin skills.",
    });
  }
});

// Admin: Create skill
router.post("/", protect, async (req, res) => {
  try {
    if (!validSkillData(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Skill name and category are required.",
      });
    }

    const skill = await Skill.create(req.body);

    res.status(201).json({
      success: true,
      message: "Skill created successfully.",
      skill,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Unable to create skill.",
    });
  }
});

// Admin: Update skill
router.put("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill ID.",
      });
    }

    const allowedFields = [
      "name",
      "category",
      "level",
      "icon",
      "order",
      "published",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.hasOwn(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (
      Object.hasOwn(updates, "name") &&
      (typeof updates.name !== "string" || !updates.name.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Skill name cannot be empty.",
      });
    }

    if (
      Object.hasOwn(updates, "category") &&
      (typeof updates.category !== "string" || !updates.category.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Skill category cannot be empty.",
      });
    }

    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Skill updated successfully.",
      skill,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Unable to update skill.",
    });
  }
});

// Admin: Delete skill
router.delete("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill ID.",
      });
    }

    const skill = await Skill.findByIdAndDelete(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Skill deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete skill.",
    });
  }
});

export default router;
