import { useSelector } from "react-redux";
import AntdTable from "../../components/AntdTable";
import { useState } from "react";

const Feedbacks = () => {
  const columns = [
    {
      title: "Course Name",
      dataIndex: "courseName",
    },
    {
      title: "Student Name",
      render(item) {
        const student = students.find((s) => s._id === item.userId);
        return student ? student.name : "";
      },
    },
    {
      title: "Teachers",
      dataIndex: "teachers",
    },
    {
        title: "Feedback",
        dataIndex: "feedback",
    }
  ];

  const students = useSelector((state) => state.myReducer.users).filter(
    (user) => user.role == "student" && user.account_status == "active"
  );
  const departments = useSelector((state) => state.myReducer.departments);

  const feedbacks = useSelector((state) => state.myReducer.feedbacks);
  console.log("feedbacks", feedbacks);

  const [filteredStudents, setFilteredStudents] = useState(students);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState(feedbacks);

  return (
    <div className="w-100">
      <h5 className="text-center">Feedbacks</h5>
      <AntdTable columns={columns} data={filteredFeedbacks} width="80%" />
    </div>
  );
};
export default Feedbacks;
