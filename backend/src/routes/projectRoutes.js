import express from "express";
import mongoose from "mongoose";

import Project from "../models/Project.js";
import protect from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Public: Get all published projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({ published: true })
      .sort({ featured: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch projects.",
    });
  }
});



// Admin: Get all projects (published + drafts)
router.get("/admin/all", protect, async (req, res) => {
  try {
    const projects = await Project.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch admin projects.",
    });
  }
});





// Admin: Upload project image
router.post(
  "/upload-image",
  protect,
  (req, res, next) => {
    upload.single("image")(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          success: false,
          message:
            error.code === "LIMIT_FILE_SIZE"
              ? "Image size must not exceed 5 MB."
              : error.message || "Image upload failed.",
        });
      }

      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image.",
      });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/projects/${req.file.filename}`;

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully.",
      imageUrl,
    });
  }
);




// Public: Get one published project
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      published: true,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch project.",
    });
  }
});

// Admin: Create project
router.post("/", protect, async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      techStack,
      githubUrl,
      liveUrl,
      featured,
      published,
    } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !Array.isArray(techStack)
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, description and techStack array are required.",
      });
    }

    const project = await Project.create({
      title,
      description,
      image,
      techStack,
      githubUrl,
      liveUrl,
      featured,
      published,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully.",
      project,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Unable to create project.",
    });
  }
});

// Admin: Update project
router.put("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "image",
      "techStack",
      "githubUrl",
      "liveUrl",
      "featured",
      "published",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.hasOwn(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      project,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Unable to update project.",
    });
  }
});

// Admin: Delete project
router.delete("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete project.",
    });
  }
});

export default router;
