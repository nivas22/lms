const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require('path');
const app = express();
const cors = require("cors");

const User = require("./models/user");
const Department = require("./models/department");
const Course = require("./models/course");
const Token = require("./models/token");
const CourseRegistration = require("./models/course-registration");
const StudentActivity = require("./models/student-activity");
const StudentNote = require("./models/student-notes");
const Lesson = require("./models/lesson");
const Exam = require("./models/exam");

const { loadDepartments, loadCoursesFromFiles } = require("./loadCourses");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

require("dotenv").config();
const bcrypt = require("bcrypt");
const multer = require("multer");
const mongodburl = process.env.MONGODB_URL;
const { google } = require("googleapis");
const { v4: uuidv4 } = require("uuid");
const Feedback = require("./models/feedback");
const OAuth2 = google.auth.OAuth2;
const port = process.env.PORT || 3001;

mongoose
  .connect(mongodburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to MongoDB", mongodburl);
    console.log("MongoDB connected");

    await loadCoursesFromFiles();
    await loadDepartments();

  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

/*UTILITIES */


// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
}).array("files", 10);

/*   API ROUTES    */
app.post("/create-account", (req, response) => {
  const { name, email, password, grade, department, role } = req.body;
  console.log(req.body);
  bcrypt
    .hash(password, 10)
    .then((res) => {
      console.log(res);
      const hashedPw = res;
      const newUser = new User({
        name: name,
        email: email,
        password: hashedPw,
        department: convertFieldsToObjectId(department),
        grade: grade,
        role: role,
      });
      newUser
        .save()
        .then((res) => { console.log(res); return response.json({ result: res })})
        .catch((err) => response.json({ error: err }));
    })
    .catch((err) => { console.log(err); return response.json({ error: err })});
});

app.post("/send-email", (req, response) => {
  const { isHtml, to, subject, html, text } = req.body;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Account Status Update</title>
<style>
*{
  box-sizing:border-box;
}
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
  }
  .container {
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    background-color: #fff;
    border:1px solid black;
    border-radius: 8px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
  h1 {
    color: #333;
    text-align: center;
  }
  p {
    color: #666;
    line-height: 1.6;
  }
  .button {
    display: block;
    width:10rem;
    padding: 10px 20px;
    background-color: darkslategray;
    color: white;
    border-radius: 5px;
    margin: 20px auto;
  }
  .link{
    text-decoration: none;
    color:white !important;
  }
</style>
</head>
<body>
  <div class="container">
    ${html ? html : ""}
    <button class="button">
    <a class="link" noreferrer target='_blank' noopener href=${
      process.env.NODE_ENV === "production"
        ? "https://mentoriq-1.onrender.com/"
        : "http://localhost:3000"
    }>Visit Our Website</a>
    </button>
  </div>
</body>
</html>
`;

  const oauth2Client = new OAuth2(
    process.env.NODE_MAILER_CLIENT_ID,
    process.env.NODE_MAILER_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.NODE_MAILER_REFRESH_TOKEN,
  });

  const accessToken = new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        response.json({ error: err });
      }
    });
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.NODE_MAILER_EMAIL,
      accessToken,
      clientId: process.env.NODE_MAILER_CLIENT_ID,
      clientSecret: process.env.NODE_MAILER_CLIENT_SECRET,
      refreshToken: process.env.NODE_MAILER_REFRESH_TOKEN,
    },
  });

  const mailOptions = {
    from: '"Fanuel Amare from MentorIQ "<fanu7.dev@gmail.com>',
    to: to,
    subject: subject,
    text: isHtml ? "" : text,
    html: isHtml ? htmlContent : "",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      response.json({ error: error });
    } else {
      response.json({ result: info.response });
    }
  });
});

app.post("/change-password/:id", (req, response) => {
  const uid = req.params.id;
  const { newPassword } = req.body;
  bcrypt
    .hash(newPassword, 10)
    .then((res) => {
      const hashedPw = res;
      User.findByIdAndUpdate(uid, { password: hashedPw })
        .then((res) => {
          response.json({ result: res });
        })
        .catch((err) => {
          response.json({ error: err });
        });
    })
    .catch((err) => response.json({ error: err }));
});

app.post("/change-profile/:id", (req, response) => {
  const uid = req.params.id;
  const { name, email } = req.body;
  User.findByIdAndUpdate(uid, { name: name, email: email })
    .then((res) => {
      response.json({ result: res });
    })
    .catch((err) => {
      response.json({ error: err });
    });
});

app.post("/update-user/:id", (req, response) => {
  const { account_status } = req.body;
  const id = req.params.id;
  User.findByIdAndUpdate(id, { account_status: account_status })
    .then((res) => {
      response.json({ result: res });
    })
    .catch((err) => {
      response.json({ err: err });
    });
});

app.post("/submit-course-feedback", (req, response) => {
  console.log(req.body);
  Feedback.create(req.body)
    .then((res) => {
      response.json({ result: res });
    })
    .catch((err) => {
      response.json({ error: err });
    });
});

app.get("/get-users", (req, response) => {
  User.find()
    .then((res) => response.json({ result: res }))
    .catch((err) => {
      response.json({ error: err });
    });
});

app.post("/filterUserByEmail", (req, response) => {
  const { email } = req.body;
  User.find({ email: email })
    .then((res) => {
      response.json({ result: res });
    })
    .catch((err) => {
      response.json({ error: err });
    });
});

app.post("/checkCredentials", async (req, response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    response.json({ error: "User Not Found!" });
    return;
  }
  const pwmatch = await bcrypt.compare(password, user.password);
  if (!pwmatch) {
    response.json({ error: "Wrong Password" });
    return;
  }

  response.json({ result: user });
});

app.post("/create-department", (req, response) => {
  const { name } = req.body;
  const newDept = new Department({
    title: name,
  });

  newDept
    .save()
    .then((res) => response.json({ result: res }))
    .catch((err) => response.json({ error: err }));
});

app.post("/update-department/:id", (req, response) => {
  const { name } = req.body;
  const id = req.params.id;
  Department.findByIdAndUpdate(id, { title: name })
    .then((res) => {
      response.json({ result: res });
    })
    .catch((err) => {
      response.json({ err: err });
    });
});

app.get("/get-departments", (req, response) => {
  Department.find()
    .then((res) => response.json({ result: res }))
    .catch((err) => {
      response.json({ error: err });
    });
});

app.get("/delete-department/:id", (req, response) => {
  const id = req.params.id;
  Department.findByIdAndDelete(id)
    .then((res) => {
      response.json({ result: res });
    })
    .catch((err) => {
      response.json({ error: true });
    });
});

app.get("/delete-lesson/:id", (req, response) => {
  const id = req.params.id;
  Lesson.findByIdAndDelete(id)
    .then((res) => {
      response.json({ result: res });
    })
    .catch((err) => {
      response.json({ error: true });
    });
});

app.post("/filterDeptByName", (req, response) => {
  const { name } = req.body;
  Department.find({ title: name })
    .then((res) => {
      response.json({ result: res });
    })
    .catch((err) => {
      response.json({ error: err });
    });
});

app.get("/get-courses", (req, response) => {
  Course.find()
    .then((res) => response.json({ result: res }))
    .catch((err) => {
      response.json({ error: err });
    });
});

app.get("/get-course-quiz/:courseId", (req, res) => {
  const { courseId } = req.params;

  Course.findById(courseId)
    .select("questions")
    .then((course) => {
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json({ result: course.questions });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});


app.post("/create-course", (req, response) => {
  const { name, courseid, department } = req.body;
  const newDept = new Course({
    title: name,
    id: courseid,
    department: convertFieldsToObjectId(department),
  });

  newDept
    .save()
    .then((res) => response.json({ result: res }))
    .catch((err) => response.json({ error: err }));
});

app.post("/update-course/:id", (req, response) => {
  const { name, courseid, department } = req.body;
  const id = req.params.id;
  Course.findByIdAndUpdate(id, {
    title: name,
    id: courseid,
    department: department,
  })
    .then((res) => {
      response.json({ result: res });
    })
    .catch((err) => {
      response.json({ err: err });
    });
});

app.post("/assign-teacher-to-course/:id", (req, response) => {
  const { teachers } = req.body;
  const id = req.params.id;
  Course.findByIdAndUpdate(id, { teachers: JSON.parse(teachers) })
    .then((res) => {
      response.json({ result: res });
    })
    .catch((err) => {
      response.json({ err: err });
    });
});

app.get("/release-course/:id", (req, response) => {
  const id = req.params.id;
  Course.findByIdAndUpdate(id, { status: "active" })
    .then((res) => {
      response.json({ result: res });
    })
    .catch((err) => {
      response.json({ err: err });
    });
});

app.get("/delete-course/:id", (req, response) => {
  const id = req.params.id;
  Course.findByIdAndDelete(id)
    .then((res) => {
      response.json({ result: res });
    })
    .catch((err) => {
      response.json({ error: true });
    });
});

app.post("/filterCourseByName", (req, response) => {
  const { name } = req.body;
  Course.find({ title: name })
    .then((res) => {
      response.json({ result: res });
    })
    .catch((err) => {
      response.json({ error: err });
    });
});

app.post("/filterCourseById", (req, response) => {
  const { courseid } = req.body;
  Course.find({ id: courseid })
    .then((res) => {
      response.json({ result: res });
    })
    .catch((err) => {
      response.json({ error: err });
    });
});

app.post("/upload-lesson", (req, response) => {
  upload(req, response, (err) => {
    if (err) {
      response.json({ error: err });
      return;
    }
    const { course, title, filePaths, uploadedBy } = req.body;
    const newLesson = new Lesson({
      course: course,
      title: title,
      filePaths: filePaths,
      uploadedBy: uploadedBy,
    });
    newLesson
      .save()
      .then((res) => {
        response.json({ result: res });
      })
      .catch((err) => {
        response.json({ error: err });
      });
  });
});

app.get("/get-lessons", (req, response) => {
  Lesson.find()
    .then((res) => {
      response.json({ result: res });
    })
    .catch((err) => {
      response.json({ error: err });
    });
});

app.get("/get-course-regs", (req, response) => {
  CourseRegistration.find()
    .then((res) => {
      response.json({ result: res });
    })
    .catch((err) => {
      response.json({ error: err });
    });
});

app.post("/register-for-course", async (req, response) => {
  const { uid, courseid } = req.body;

  try {
    // Check if the user is already registered for another active course
    const existingRegistration = await CourseRegistration.findOne({
      user: convertFieldsToObjectId(uid),
      status: { $in: ["registered", "in-progress"] } // you can adjust these statuses
    });

    if (existingRegistration) {
      return response.status(400).json({
        error: "You are already enrolled in another course. You can only access one course at a time."
      });
    }

    // Calculate exam schedule time (2 weeks from now)
    const examScheduleTime = new Date();
    examScheduleTime.setDate(examScheduleTime.getDate() + 14);

    // Proceed to register for the new course
    const newCourseReg = new CourseRegistration({
      course: convertFieldsToObjectId(courseid),
      user: convertFieldsToObjectId(uid),
      status: "registered",
      examScheduleTime // store exam schedule time
    });

    const savedCourseReg = await newCourseReg.save();
    response.json({ result: savedCourseReg });

  } catch (err) {
    response.status(500).json({ error: err.message });
  }
});

app.post("/update-course-reg/:id", (req, response) => {
  const { id } = req.params;
  const { status } = req.body;
  CourseRegistration.findByIdAndUpdate(id, { status: status })
    .then((res) => response.json({ result: res }))
    .catch((err) => {
      response.json({ error: err });
    });
});

app.get("/get-exams", (req, response) => {
  Exam.find()
    .then((Res) => {
      response.json({ result: Res });
    })
    .catch((err) => {
      response.json({ error: err });
    });
});

app.post("/upload-exam", (req, response) => {
  upload(req, response, (err) => {
    if (err) {
      response.json({ error: err });
      return;
    }
    const { lesson, title, filePaths } = req.body;
    const newExam = new Exam({
      lesson: convertFieldsToObjectId(lesson),
      title: title,
      filePaths: filePaths,
    });
    newExam
      .save()
      .then((res) => {
        response.json({ result: res });
      })
      .catch((err) => {
        response.json({ error: err });
      });
  });
});

app.get("/generate-token", (req, response) => {
  const uuid = uuidv4();
  const token = new Token({ token: uuid });
  token
    .save()
    .then((res) => {
      response.json({ result: res });
    })
    .catch((err) => {
      response.json({ error: err });
    });
});

app.get("/verify-token/:token", (req, response) => {
  const { token } = req.params;
  Token.findOne({ token: token, status: "active" })
    .then((res) => response.json({ result: res }))
    .catch((err) => response.json({ error: err }));
});

app.get("/deactivate-token/:token", (req, response) => {
  const token = req.params.token;
  Token.findOneAndDelete({ token: token })
    .then((res) => {
      response.json({ result: res });
    })
    .catch((err) => {
      response.json({ error: err });
    });
});

app.get("/get-all-student-activities", (req, response) => {
  StudentActivity.find()
    .then((res) => response.json({ result: res }))
    .catch((err) => {
      response.json({ error: err });
    });
});

app.post("/create-student-activity", (req, response) => {
  const { student, course, lesson } = req.body;
  const newActivity = new StudentActivity({
    student: student,
    course: course,
    lesson: lesson,
  });
  newActivity
    .save()
    .then((res) => {
      response.json({ result: res });
    })
    .catch((err) => {
      response.json({ error: err });
    });
});

app.post("/update-student-activity/:id", async (req, response) => {
  const { id } = req.params;
  const updateData = req.body;
  if (updateData.note) {
    const activity = await StudentActivity.findById(id);
    activity.notes.push(updateData.note);
    activity.save().then((res) => response.json({ result: res }));
  }
});

app.get("/get-all-student-notes", (req, response) => {
  StudentNote.find()
    .then((res) => response.json({ result: res }))
    .catch((err) => {
      response.json({ error: err });
    });
});

app.post("/create-student-note", (req, response) => {
  const { subject, content } = req.body;
  const newNote = new StudentNote({
    subject: subject,
    content: content,
  });
  newNote
    .save()
    .then((res) => {
      response.json({ result: res });
    })
    .catch((err) => {
      response.json({ error: err });
    });
});

app.post("/update-student-note", async (req, response) => {
  const { id, subject, content } = req.body;
  StudentNote.findByIdAndUpdate(id, { subject: subject, content: content })
    .then((res) => response.json({ result: res }))
    .catch((err) => response.json({ error: err }));
});

app.post("/upload-student-activity-file/:id", async (req, response) => {
  const { id } = req.params;
  const { filePaths } = req.body;
  upload(req, response, async (err) => {
    if (err) {
      response.json({ error: err });
      return;
    }

    const activity = await StudentActivity.findById(id);
    filePaths &&
      JSON.parse(filePaths).map((path) => activity.filePaths.push(path));
    activity
      .save()
      .then((res) => response.json({ result: res }))
      .catch((err) => response.json({ error: err }));
  });
});

// GET users who completed courses created by a given teacher
// GET users who completed courses created by a given teacher
app.get("/get-completed-course-users/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;

    // 1️⃣ Find all courses created by this teacher
    const teacherCourses = await Course.find({ teachers: teacherId }).select("_id");

    if (!teacherCourses.length) {
      return res.json({ result: [] });
    }

    const courseIds = teacherCourses.map(c => c._id);

    // 2️⃣ Find registrations with status 'finished' for those courses
    const completedRegs = await CourseRegistration.find({
      course: { $in: courseIds },
      status: { $in: ["FEEDBACK_DONE", "issued"] }
    })
      .populate("user", "name email role") // only needed fields from user
      .populate("course"); // full course details

    // 3️⃣ Prepare result
    const completedUsers = completedRegs.map(reg => ({
      _id: reg._id,
      status: reg.status,
      course: reg.course,         // now contains full course object
      user: reg.user,          // user object with name/email/role
      completedAt: reg.updatedAt, // date they completed
    }));

    res.json({ result: completedUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.patch("/issue-certificate/:registrationId", async (req, res) => {
  try {
    const { registrationId } = req.params;

    const updated = await CourseRegistration.findByIdAndUpdate(
      registrationId,
      { status: "issued" },
      { new: true }
    )
      .populate("user", "name email role")
      .populate("course");

    if (!updated) {
      return res.status(404).json({ error: "Course registration not found" });
    }

    res.json({ result: updated, message: "Certificate issued successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


//Methods
const convertFieldsToObjectId = (input) => {
  const objId = new mongoose.Types.ObjectId(input);
  return objId;
};

app.listen(port, () => {
  console.log(`Server Listening on Port ${port}`);
});
