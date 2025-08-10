// loadCourses.js
const fs = require("fs");
const path = require("path");
const Course = require("./models/course");

async function loadCoursesFromFiles() {
  const dataDir = path.join(__dirname, "data");
  const files = fs.readdirSync(dataDir);

  for (const file of files) {
    if (file.endsWith(".json")) {
      const courseName = path.basename(file, ".json"); // e.g. Java
      const filePath = path.join(dataDir, file);
      const questions = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      await Course.findOneAndUpdate(
        { title: courseName },
        { $set: { questions } }, // update or add questions
        { upsert: true, new: true }
      );

      console.log(`Loaded questions for course: ${courseName}`);
    }
  }
}

module.exports = loadCoursesFromFiles;
