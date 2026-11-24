import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    position: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    employmentType: {
      type: String,
      default: "Full-time",
      trim: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    currentlyWorking: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    technologies: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
    published: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

experienceSchema.pre("validate", function () {
  if (this.currentlyWorking) {
    this.endDate = null;
  } else if (this.endDate && this.startDate && this.endDate < this.startDate) {
    this.invalidate("endDate", "End date cannot be before start date.");
  }
});

const Experience = mongoose.model("Experience", experienceSchema);

export default Experience;
