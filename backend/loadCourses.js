// loadCourses.js
const fs = require("fs");
const path = require("path");
const Course = require("./models/course");
const Department = require("./models/department");

const defaultDepartments = [
  { title: "Engineering" },
  { title: "Human Resources" },
  { title: "Marketing" },
];

async function loadDepartments() {
  for (const dept of defaultDepartments) {
    const updated = await Department.findOneAndUpdate(
      { title: dept.title },  // match by title
      { $set: dept },         // update fields
      { new: true, upsert: true }           // no upsert → won't create
    );

    if (!updated) {
      console.log(`Department not found, skipping: ${dept.title}`);
    } else {
      console.log(`Updated department: ${dept.title}`);
    }
  }
}


async function loadCoursesFromFiles() {
  const dataDir = path.join(__dirname, "data");
  const files = fs.readdirSync(dataDir);

  for (const file of files) {
    if (file.endsWith(".json")) {
      const courseName = path.basename(file, ".json"); // e.g. Java
      const filePath = path.join(dataDir, file);
      const questions = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      const updatedCourse = await Course.findOneAndUpdate(
        { title: courseName },
        { $set: { questions } },
        { new: true } // no upsert
      );

      if (!updatedCourse) {
        console.log(`Course not found, skipping: ${courseName}`);
      } else {
        console.log(`Updated questions for course: ${courseName}`);
      }
    }
  }
}

module.exports = {
  loadDepartments,
  loadCoursesFromFiles
};
