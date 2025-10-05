import { Button, Input, Modal, Select, message } from "antd";
import AntdTable from "../../components/AntdTable";
import { useEffect, useState } from "react";
import { fetcher } from "../../_services";
import { useDispatch, useSelector } from "react-redux";
import { setLessons } from "../../store/store";
import {
  DeleteOutlined,
  PlusCircleFilled,
  UploadOutlined,
} from "@ant-design/icons";
import API_URL from "../../apiUrl";

const MyLessons = () => {
  const apiUrl = API_URL;
  const dispatch = useDispatch();

  const allCourses = useSelector((state) => state.myReducer.courses);
  const allLessons = useSelector((state) => state.myReducer.lessons);
  const allExams = useSelector((state) => state.myReducer.exams);

  const [error, setError] = useState(false);

  useEffect(() => {
    if (error) message.error("Fetching Data Error !");
  }, [error]);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const myCourses = allCourses.filter((course) =>
    course.teachers.includes(currentUser._id)
  );

  console.log("teacher courses:", JSON.stringify(myCourses));
  console.log("lessons:", JSON.stringify(allLessons));

  // ✅ Extract all the course IDs the current teacher is associated with
  const myCourseIds = myCourses.map(course => course._id);

  // ✅ Filter lessons that belong to those courses only
  const myLessons = allLessons.filter(
    (lesson) => myCourseIds.includes(lesson.course)
  );

  console.log("filtered lessons:", JSON.stringify(myLessons));

  const myExams = allExams.filter((exam) =>
    myLessons.some((lesson) => lesson._id === exam.lesson)
  );

  const [filteredLessons, setFilteredLessons] = useState(myLessons);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [showViewExamModal, setShowViewExamModal] = useState(false);
  const [filterBy, setFilterBy] = useState("name");
  const [filterCondition, setFilterCondition] = useState("");
  const [newLesson, setNewLesson] = useState({ course: "", title: "", files: [] });
  const [newExam, setNewExam] = useState({ title: "", files: [] });
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedLessonForExam, setSelectedLessonForExam] = useState(null);

  useEffect(() => {
    if (selectedLesson) {
      const exam = myExams.find((exam) => exam.lesson === selectedLesson._id);
      setSelectedLessonForExam(exam || null);
      console.log("Exam for selected lesson:", exam);
    }
  }, [selectedLesson, myExams]);

  const columns = [
    {
      title: "Course Name",
      render(item) {
        const matchedCourse = myCourses.find(
          (course) => course._id === item.course
        );
        return matchedCourse ? matchedCourse.title : "N/A";
      },
    },
    {
      title: "Course ID",
      render(item) {
        const matchedCourse = myCourses.find(
          (course) => course._id === item.course
        );
        return matchedCourse ? matchedCourse.id : "N/A";
      },
    },
    { title: "Lesson Title", dataIndex: "title" },
    {
      title: "Uploaded in",
      render(item) {
        return item.createdAt ? item.createdAt.split("T")[0] : "N/A";
      },
    },
    {
      title: "Files",
      render(item) {
        const files = item.filePaths ? JSON.parse(item.filePaths) : [];
        return files?.length || 0;
      },
    },
    {
      title: "Actions",
      render(item) {
        return (
          <>
            <Button
              onClick={() => {
                setShowViewModal(true);
                setSelectedLesson(item);
              }}
              className="bg-success text-white"
            >
              View
            </Button>

            <Button
              className="ms-2 bg-warning text-black"
              onClick={() => {
                console.log("Selected Lesson:", item);
                setSelectedLesson(item);
                setShowViewExamModal(true);
              }}
              icon={<PlusCircleFilled />}
            >
              Question
            </Button>
          </>
        );
      },
    },
  ];

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    if (type === "lesson") {
      setNewLesson((prev) => ({ ...prev, files: [...prev.files, files] }));
    } else {
      setNewExam((prev) => ({ ...prev, files: [...prev.files, files] }));
    }
  };

  const handleRemoveFile = (fileToRemove, type) => {
    if (type === "lesson") {
      setNewLesson((prev) => ({
        ...prev,
        files: prev.files.filter((file) => file !== fileToRemove),
      }));
    } else {
      setNewExam((prev) => ({
        ...prev,
        files: prev.files.filter((file) => file !== fileToRemove),
      }));
    }
  };

  const handleSubmit = () => {
    const filePaths = newLesson.files.map((file) => file[0].name);
    const formData = new FormData();
    newLesson.files.forEach((file) => formData.append("files", file[0]));
    formData.append("course", newLesson.course);
    formData.append("title", newLesson.title);
    formData.append("uploadedBy", currentUser._id);
    formData.append("filePaths", JSON.stringify(filePaths));

    fetch(`${apiUrl}/upload-lesson`, {
      method: "post",
      body: formData,
    })
      .then((res) => res.json())
      .then(() => {
        setNewLesson({ course: "", title: "", files: [] });
        setShowAddModal(false);
      })
      .catch((err) => {
        console.log("error", err);
        setError(true);
      });
  };

  const getLessons = async () => {
    await fetcher("get-lessons").then((res) => {
      const less = res.result;
      const myLessons = less.map((dept) => ({
        name: dept.title,
        value: dept._id,
      }));
      dispatch(setLessons(myLessons));
      setFilteredLessons(myLessons);
    });
  };

  const deleteLesson = (item) => {
    if (!item || !item._id) {
      message.error("Invalid lesson data!");
      return;
    }

    fetch(`${apiUrl}/delete-lesson/${item._id}`)
      .then((res) => res.json())
      .then(() => {
        message.success("My Lesson Successfully Deleted!");
        getLessons();
      })
      .catch(() => {
        message.error("Some Error Occurred!");
      });
  };

  const handleExamSubmit = () => {
    const filePaths = newExam.files.map((file) => file[0].name);
    const formData = new FormData();
    newExam.files.forEach((file) => formData.append("files", file[0]));
    formData.append("lesson", selectedLesson._id);
    formData.append("title", newExam.title);
    formData.append("filePaths", JSON.stringify(filePaths));

    fetch(`${apiUrl}/upload-exam`, {
      method: "post",
      body: formData,
    })
      .then((res) => res.json())
      .then(() => {
        setNewExam({ title: "", files: [] });
        setShowAddExamModal(false);
      })
      .catch((err) => {
        console.log("error", err);
        setError(true);
      });
  };

  const filterData = () => {
    const filtered =
      filterBy === "name"
        ? myLessons.filter((lesson) =>
            lesson.title.toLowerCase().includes(filterCondition.toLowerCase())
          )
        : myLessons.filter((lesson) => lesson.course === filterCondition);
    setFilteredLessons(filtered);
  };

  useEffect(() => {
    if (!filterCondition) setFilteredLessons(myLessons);
    else filterData();
  }, [filterCondition]);

  return (
    <div className="w-100">
      <h5 className="text-center">My Lessons</h5>

      {/* --- Top Controls --- */}
      <div
        className="mx-auto d-flex align-items-center justify-content-between p-2"
        style={{ minHeight: "2rem", maxWidth: "80%" }}
      >
        <div style={{ maxWidth: "30%" }}>
          <Button
            onClick={() => setShowAddModal(true)}
            type="primary"
            icon={<PlusCircleFilled />}
          >
            Upload Lesson
          </Button>
        </div>

        <div
          className="d-flex flex-column flex-md-row justify-content-center justify-content-md-end"
          style={{ maxWidth: "50%" }}
        >
          <div
            className="d-flex align-items-center justify-content-center"
            style={{ maxWidth: "10rem" }}
          >
            <small>Filter By : </small>
            <Select
              value={filterBy}
              className="ms-2"
              onChange={(val) => {
                setFilterBy(val);
                setFilterCondition("");
              }}
            >
              <Select.Option value="name">Name</Select.Option>
              <Select.Option value="course">Course</Select.Option>
            </Select>
          </div>
          <div
            className="d-flex align-items-center ms-2 mt-2 mt-md-0"
            style={{ maxWidth: "10rem" }}
          >
            {filterBy === "name" && (
              <Input
                onChange={(e) => setFilterCondition(e.target.value)}
                value={filterCondition}
              />
            )}
            {filterBy === "course" && (
              <Select
                className="w-100"
                value={filterCondition}
                onChange={(val) => setFilterCondition(val)}
              >
                {myCourses.map((course) => (
                  <Select.Option key={course._id} value={course._id}>
                    {course.title}
                  </Select.Option>
                ))}
              </Select>
            )}
          </div>
        </div>
      </div>

      {/* --- Lessons Table --- */}
      <AntdTable columns={columns} data={filteredLessons} width="80%" />

      {/* --- Upload Lesson Modal --- */}
      <Modal
        open={showAddModal}
        maskClosable={false}
        title="Upload Lesson"
        onCancel={() => setShowAddModal(false)}
        style={{ width: "80%" }}
        footer={[]}
      >
        {showAddModal && (
          <div className="w-100 d-flex flex-column">
            <label htmlFor="course">Select Course</label>
            <Select
              id="course"
              value={newLesson.course}
              onChange={(val) => setNewLesson({ ...newLesson, course: val })}
            >
              {myCourses.map((course) => (
                <Select.Option key={course._id} value={course._id}>
                  {course.title}
                </Select.Option>
              ))}
            </Select>

            <label htmlFor="course" className="mt-2">
              Give your lesson a title
            </label>
            <Input
              value={newLesson.title}
              onChange={(e) =>
                setNewLesson({ ...newLesson, title: e.target.value })
              }
            />

            <label className="mt-2">Attach Files</label>
            <Button
              onClick={() => document.getElementById("attachLessonFile").click()}
              style={{ maxWidth: "10rem" }}
              icon={<UploadOutlined />}
              className="bg-success text-white"
            >
              {newLesson.files?.length > 0 ? "Add File" : "Upload"}
            </Button>

            <div className="w-100 d-flex flex-column">
              <small>Uploaded Files :</small>
              {newLesson.files?.length > 0 ? (
                <ul>
                  {newLesson.files.map((file, idx) => (
                    <li key={idx} className="d-flex align-items-center">
                      <p className="text-truncate m-0" style={{ width: "80%" }}>
                        {file[0].name}
                      </p>
                      <Button
                        onClick={() => handleRemoveFile(file, "lesson")}
                        type="text"
                        className="text-danger ms-3 d-flex justify-content-center align-items-center"
                      >
                        <DeleteOutlined />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No File Uploaded!</p>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              type="primary"
              className="mx-auto"
              style={{ width: "40%" }}
            >
              Finish
            </Button>

            <input
              id="attachLessonFile"
              onChange={(e) => handleFileChange(e, "lesson")}
              hidden
              type="file"
              multiple
            />
          </div>
        )}
      </Modal>

      {/* --- View Lesson Modal --- */}
      <Modal
        open={showViewModal}
        maskClosable={false}
        title="View"
        onCancel={() => setShowViewModal(false)}
        style={{ width: "80%" }}
        footer={[]}
      >
        {showViewModal && selectedLesson && (
          <ul>
            {(() => {
              const courseInfo = myCourses.find(
                (course) => course._id === selectedLesson.course
              );
              return (
                <>
                  <li>
                    Course Name: {courseInfo ? courseInfo.title : "N/A"}
                  </li>
                  <li>
                    Course ID: {courseInfo ? courseInfo.id : "N/A"}
                  </li>
                </>
              );
            })()}
            <li>Lesson Title : {selectedLesson.title}</li>
            <li>
              Uploaded in :{" "}
              {selectedLesson.createdAt &&
                selectedLesson.createdAt.split("T")[0]}
            </li>
            <li>
              Attached Files :
              {selectedLesson.filePaths &&
                JSON.parse(selectedLesson.filePaths).map((file, idx) => (
                  <small key={idx} className="d-block">
                    {file}&nbsp;&nbsp;
                    <a
                      href={`${apiUrl}/uploads/${file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      Download
                    </a>
                  </small>
                ))}
            </li>
          </ul>
        )}
      </Modal>

      {/* --- Add Exam Modal --- */}
      <Modal
        open={showAddExamModal}
        maskClosable={false}
        title="Add Exams and Questions"
        onCancel={() => setShowAddExamModal(false)}
        style={{ width: "80%" }}
        footer={[]}
      >
        {showAddExamModal && (
          <div className="w-100 d-flex flex-column">
            <p className="m-0">
              Selected Lesson : <b>{selectedLesson?.title}</b>
            </p>
            <hr className="m-0" />

            <label className="mt-2">Give a title for the Exam / Question</label>
            <Input
              value={newExam.title}
              onChange={(e) =>
                setNewExam({ ...newExam, title: e.target.value })
              }
            />

            <label className="mt-2">Attach Files</label>
            <Button
              onClick={() =>
                document.getElementById("attachExamFile").click()
              }
              style={{ maxWidth: "10rem" }}
              icon={<UploadOutlined />}
              className="bg-success text-white"
            >
              {newExam.files?.length > 0 ? "Add File" : "Upload"}
            </Button>

            <div className="w-100 d-flex flex-column">
              <small>Uploaded Files :</small>
              {newExam.files?.length > 0 ? (
                <ul>
                  {newExam.files.map((file, idx) => (
                    <li key={idx} className="d-flex align-items-center">
                      <p className="text-truncate m-0" style={{ width: "80%" }}>
                        {file[0].name}
                      </p>
                      <Button
                        onClick={() => handleRemoveFile(file, "exam")}
                        type="text"
                        className="text-danger ms-3 d-flex justify-content-center align-items-center"
                      >
                        <DeleteOutlined />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No File Uploaded!</p>
              )}
            </div>

            <Button
              onClick={handleExamSubmit}
              type="primary"
              className="mx-auto"
              style={{ width: "40%" }}
            >
              Finish
            </Button>

            <input
              id="attachExamFile"
              onChange={(e) => handleFileChange(e, "exam")}
              hidden
              type="file"
              multiple
            />
          </div>
        )}
      </Modal>

      {/* --- View Exam Modal --- */}
      <Modal
        open={showViewExamModal}
        maskClosable={false}
        title="View Exams and Questions"
        onCancel={() => setShowViewExamModal(false)}
        style={{ width: "80%" }}
        footer={[]}
      >
        {showViewExamModal && selectedLesson && (
          <div className="w-100 d-flex flex-column">
            {myExams.some((exam) => exam.lesson === selectedLesson._id) ? (
              <div className="d-flex flex-column justify-content-center align-items-center w-100">
                <Button
                  icon={<PlusCircleFilled />}
                  type="primary"
                  style={{ minWidth: "5rem" }}
                  onClick={() => {
                    setShowViewExamModal(false);
                    setShowAddExamModal(true);
                  }}
                >
                  Add New Exam/Question
                </Button>
                <ul className="w-100">
                  <li>Lesson Title : {selectedLesson.title}</li>
                  <li>
                    Exam Title :{" "}
                    {selectedLessonForExam?.title || ""}
                  </li>
                  <li>
                    Uploaded in :{" "}
                    {selectedLessonForExam?.createdAt &&
                      selectedLessonForExam.createdAt.split("T")[0]}
                  </li>
                  <li>
                    Attached Files :
                    {selectedLessonForExam?.filePaths &&
                      JSON.parse(selectedLessonForExam.filePaths).map(
                        (file, idx) => (
                          <small key={idx} className="d-block">
                            {file}&nbsp;&nbsp;
                            <a
                              href={`${apiUrl}/uploads/${file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                            >
                              Download
                            </a>
                          </small>
                        )
                      )}
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex flex-column justify-content-center align-items-center w-100">
                <p>No Exam Found</p>
                <Button
                  icon={<PlusCircleFilled />}
                  type="primary"
                  style={{ minWidth: "5rem" }}
                  onClick={() => {
                    setShowViewExamModal(false);
                    setShowAddExamModal(true);
                  }}
                >
                  Add Exam
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyLessons;
