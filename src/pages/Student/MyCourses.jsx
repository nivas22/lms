import { useDispatch, useSelector } from "react-redux";
import AntdTable from "../../components/AntdTable";
import { useEffect, useState, useRef } from "react";
import { Button, Input, Popconfirm, Select, message, Modal, Form, Radio } from "antd";
import { fetcher } from "../../_services";
import { setCourseRegs } from "../../store/store";
import API_URL from "../../apiUrl";
import html2canvas from "html2canvas";
import dayjs from "dayjs";
import { Tooltip } from "antd";

const COURSE_STATUS = Object.freeze({
  REGISTERED: "REGISTERED",
  EXAM_DONE: "EXAM_DONE",
  FEEDBACK_DONE: "FEEDBACK_DONE",
  ISSUED: "ISSUED",
});

// Example usage
console.log(COURSE_STATUS.REGISTERED); // "REGISTERED"



const PASS_MARKS = 70; // Passing percentage

const MyCourses = () => {
  const apiUrl = API_URL;
  const [error, setError] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCertModalVisible, setIsCertModalVisible] = useState(false);
  const [isQuizModalVisible, setIsQuizModalVisible] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [clickedCourseReg, setClickedCourseReg] = useState(null);
  const [feedback, setFeedback] = useState("");

  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});

  const dispatch = useDispatch();
  const certRef = useRef(null);

  useEffect(() => {
    if (error) message.error("Fetching Data Error !");
  }, [error]);

  const allCourses = useSelector((state) => state.myReducer.courses);
  const courseRegs = useSelector((state) => state.myReducer.courseRegs);
  const allLessons = useSelector((state) => state.myReducer.lessons);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const myCourses = allCourses.filter(
    (course) => course.department === currentUser.department
  );

  const myCourseRegs = courseRegs.filter((cr) => cr.user === currentUser._id);

  const myFinalCourses = myCourses.filter((course) =>
    myCourseRegs.some((cr) => cr.course === course._id)
  );

  const myLessons = allLessons.filter((lesson) =>
    myCourses.some((course) => course._id === lesson.course)
  );

  const [filteredCourses, setFilteredCourses] = useState(myFinalCourses);
  const [filterBy, setFilterBy] = useState("title");
  const [filterCondition, setFilterCondition] = useState("");

  const filterData = () => {
    const filtered =
      filterBy === "title"
        ? myCourses.filter((course) =>
            course.title.toLowerCase().includes(filterCondition.toLowerCase())
          )
        : myCourses.filter((course) =>
            course.id.toLowerCase().includes(filterCondition.toLowerCase())
          );
    setFilteredCourses(filtered);
  };

  const getCourseRegs = () => {
    fetcher("get-course-regs").then((res) => {
      const regs = res.result;
      dispatch(setCourseRegs(regs));
    });
  };

  const updateCourseReg = (courseReg, status, score) => {
    fetch(`${apiUrl}/update-course-reg/${courseReg._id}`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, score }),
    })
      .then((res) => res.json())
      .then(() => {
        getCourseRegs();
        const course = myCourses.find((c) => c._id === courseReg.course);
        setSelectedCourse(course);
      })
      .catch(() => setError(true));
  };

  const handleFeedbackSubmit = () => {
    if (!feedback.trim()) {
      message.warning("Please enter your feedback.");
      return;
    }

    fetch(`${apiUrl}/submit-course-feedback`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: selectedCourse._id,
        teacherId: selectedCourse.teacher,
        userId: currentUser._id,
        feedback,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        message.success("Feedback submitted successfully!");
        setIsModalVisible(false);
        setFeedback("");
        setSelectedCourse(null);
        updateCourseReg(clickedCourseReg, COURSE_STATUS.FEEDBACK_DONE);
      })
      .catch(() => message.error("Failed to submit feedback."));
  };

  const handleDownloadCertificate = () => {
    if (!certRef.current) return;
    html2canvas(certRef.current, { scale: 2 }).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `certificate-${selectedCourse?.title || "course"}.png`;
      link.click();
    });
  };

  // Load quiz questions from API
  const  startQuiz = (course) => {
    setSelectedCourse(course);
    fetch(`${apiUrl}/get-course-quiz/${course._id}`)
      .then((res) => res.json())
      .then((data) => {
        setQuizQuestions(data.result || []);
        setQuizAnswers({});
        setIsQuizModalVisible(true);
      })
      .catch(() => {
        message.error("Failed to load quiz.");
      });
  };

  const submitQuiz = () => {
    let correctCount = 0;
    quizQuestions.forEach((q, index) => {
      if (quizAnswers[index] === q.answer) {
        correctCount++;
      }
    });

    const score = (correctCount / quizQuestions.length) * 100;

    if (score >= PASS_MARKS) {
      message.success(`You passed with ${score.toFixed(0)}%!`);
      const courseReg = courseRegs.find((cr) => cr.course === selectedCourse._id);
      if (courseReg) updateCourseReg(courseReg, COURSE_STATUS.EXAM_DONE, score);
    } else {
      message.error(`You scored ${score.toFixed(0)}%. Please try again.`);
    }

    setIsQuizModalVisible(false);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "title",
    },
    {
      title: "Course ID",
      dataIndex: "id",
    },
    {
      title: "Subscribed in",
      render(item) {
        const courseReg = courseRegs.find((cr) => cr.course === item._id);
        return courseReg ? courseReg.createdAt.split("T")[0] : "";
      },
    },
    {
      title: "My Status",
      render(item) {
        const courseReg = courseRegs.find((cr) => cr.course === item._id);
        if (!courseReg || !courseReg.createdAt || !courseReg.updatedAt) return "";

        const createdAt = new Date(courseReg.createdAt);
        const updated = new Date(courseReg.updatedAt);
        const timeLapse = Math.ceil((updated - createdAt) / (1000 * 60 * 60 * 24));

        return `${courseReg.status}${
          courseReg.status === "finished" || courseReg.status === "issued"
            ? ` (in ${timeLapse} ${timeLapse > 1 ? "days" : "day"})`
            : ""
        }`;
      },
    },
    {
      title: "Total Lessons",
      render(item) {
        return myLessons.filter((lesson) => lesson.course === item._id).length;
      },
    },
    {
      title: "Actions",
      render(item) {
        const courseReg = courseRegs.find((cr) => cr.course === item._id);

        if (!courseReg) return null;

        if (courseReg.status === COURSE_STATUS.REGISTERED.toLowerCase()) {
          const isBeforeExamTime = dayjs().isBefore(dayjs(courseReg.examScheduleTime));

          return (
            <Tooltip
              title={
                isBeforeExamTime
                  ? `Available on ${dayjs(courseReg.examScheduleTime).format("MMMM D, YYYY h:mm A")}`
                  : "Click to start the quiz"
              }
            >
              <Button
                type="primary"
                onClick={() => startQuiz(item)}
                disabled={isBeforeExamTime}
              >
                Take Quiz
              </Button>
            </Tooltip>
          );
        }

        if (courseReg.status === COURSE_STATUS.EXAM_DONE) {
          return (
            <Button
              type="primary"
              onClick={() => {
                setSelectedCourse(item);
                setIsModalVisible(true);
                setClickedCourseReg(courseReg);
              }}
            >
              Give Feedback
            </Button>
          );
        }

        if (courseReg.status === "issued") {
          return (
            <Button
              type="default"
              onClick={() => {
                setSelectedCourse(item);
                setIsCertModalVisible(true);
              }}
            >
              View Certificate
            </Button>
          );
        }

        return null;
      },
    },
  ];

  useEffect(() => {
    if (!filterCondition) setFilteredCourses(myFinalCourses);
    else filterData();
  }, [filterCondition]);

  return (
    <div className="w-100">
      <h5 className="text-center">My Courses</h5>

      <div
        className="mx-auto d-flex align-items-center justify-content-end p-2"
        style={{ minHeight: "2rem", maxWidth: "80%" }}
      >
        <div className="d-flex justify-content-end" style={{ width: "50%" }}>
          <div className="d-flex align-items-center" style={{ minWidth: "5rem" }}>
            <small>Filter By : </small>
            <Select
              value={filterBy}
              className="ms-2"
              onChange={(val) => {
                setFilterBy(val);
                setFilterCondition("");
              }}
            >
              <Select.Option value="title">Name</Select.Option>
              <Select.Option value="id">Course ID</Select.Option>
            </Select>
          </div>
          <div className="d-flex align-items-center ms-2" style={{ minWidth: "10rem" }}>
            <Input
              onChange={(e) => setFilterCondition(e.target.value)}
              value={filterCondition}
            />
          </div>
        </div>
      </div>

      <AntdTable columns={columns} data={filteredCourses} width="80%" />

      {/* Feedback Modal */}
      <Modal
        title={`Feedback for ${selectedCourse?.title || "this course"}`}
        visible={isModalVisible}
        onOk={handleFeedbackSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText="Submit"
      >
        <Form layout="vertical">
          <Form.Item label="Your Feedback">
            <Input.TextArea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts about this course..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Quiz Modal */}
      <Modal
        title={`Quiz - ${selectedCourse?.title}`}
        visible={isQuizModalVisible}
        onOk={submitQuiz}
        onCancel={() => setIsQuizModalVisible(false)}
        okText="Submit Quiz"
      >
        {quizQuestions.length > 0 ? (
          quizQuestions.map((q, index) => (
            <div key={index} style={{ marginBottom: "20px" }}>
              <strong>
                {index + 1}. {q.question}
              </strong>
              <Radio.Group
                onChange={(e) =>
                  setQuizAnswers((prev) => ({ ...prev, [index]: e.target.value }))
                }
                value={quizAnswers[index]}
                style={{ display: "flex", flexDirection: "column", marginTop: "5px" }}
              >
                {q.options.map((opt, i) => (
                  <Radio key={i} value={opt}>
                    {opt}
                  </Radio>
                ))}
              </Radio.Group>
            </div>
          ))
        ) : (
          <p>No quiz available for this course.</p>
        )}
      </Modal>

      {/* Certificate Modal */}
      <Modal
        visible={isCertModalVisible}
        onCancel={() => setIsCertModalVisible(false)}
        footer={[
          <Button key="download" type="primary" onClick={handleDownloadCertificate}>
            Download
          </Button>,
          <Button key="close" onClick={() => setIsCertModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        <div
          ref={certRef}
          style={{
            border: "8px solid gold",
            padding: "40px",
            textAlign: "center",
            fontFamily: "serif",
            background: "#fdfcf5",
          }}
        >
          <h1 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
            Certificate of Completion
          </h1>
          <p style={{ marginTop: "20px" }}>This is to certify that</p>
          <h2 style={{ fontSize: "2rem", color: "#2b6cb0" }}>{currentUser.name}</h2>
          <p>has successfully completed the course</p>
          <h3 style={{ fontSize: "1.8rem", color: "#38a169" }}>
            {selectedCourse?.title}
          </h3>
          <p>Date: {new Date().toLocaleDateString()}</p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginTop: "50px",
            }}
          >
            <div>
              <p>Instructor</p>
              <div
                style={{
                  borderTop: "1px solid black",
                  width: "150px",
                  margin: "auto",
                }}
              ></div>
            </div>
            <div>
              <p>Director</p>
              <div
                style={{
                  borderTop: "1px solid black",
                  width: "150px",
                  margin: "auto",
                }}
              ></div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyCourses;
