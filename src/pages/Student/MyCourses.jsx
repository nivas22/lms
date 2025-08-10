import { useDispatch, useSelector } from "react-redux";
import AntdTable from "../../components/AntdTable";
import { useEffect, useState, useRef } from "react";
import { Button, Input, Popconfirm, Select, message, Modal, Form } from "antd";
import { fetcher } from "../../_services";
import { setCourseRegs } from "../../store/store";
import API_URL from "../../apiUrl";
import html2canvas from "html2canvas"; // <-- Added for download

const MyCourses = () => {
  const apiUrl = API_URL;
  const [error, setError] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCertModalVisible, setIsCertModalVisible] = useState(false); 
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [feedback, setFeedback] = useState("");

  const dispatch = useDispatch();
  const certRef = useRef(null); // <-- Reference for certificate DOM

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

  const updateCourseReg = (courseReg, status) => {
    fetch(`${apiUrl}/update-course-reg/${courseReg._id}`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then((res) => res.json())
      .then(() => {
        getCourseRegs();
        const course = myCourses.find((c) => c._id === courseReg.course);
        setSelectedCourse(course);
        setIsModalVisible(true);
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

        if (courseReg.status === "registered") {
          return (
            <Popconfirm
              title="Finish this course?"
              onConfirm={() => updateCourseReg(courseReg, "finished")}
            >
              <Button type="primary">Finish</Button>
            </Popconfirm>
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
        <div ref={certRef} // <-- this is what gets downloaded
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
          <h2 style={{ fontSize: "2rem", color: "#2b6cb0" }}>
            {currentUser.name}
          </h2>
          <p>has successfully completed the course</p>
          <h3 style={{ fontSize: "1.8rem", color: "#38a169" }}>
            {selectedCourse?.title}
          </h3>
          <p>Date: {new Date().toLocaleDateString()}</p>
          <div style={{ display: "flex", justifyContent: "space-around", marginTop: "50px" }}>
            <div>
              <p>Instructor</p>
              <div style={{ borderTop: "1px solid black", width: "150px", margin: "auto" }}></div>
            </div>
            <div>
              <p>Director</p>
              <div style={{ borderTop: "1px solid black", width: "150px", margin: "auto" }}></div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyCourses;
