import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AntdTable from "../../components/AntdTable";
import { message, Button, Modal } from "antd";
import API_URL from "../../apiUrl";

const CompletedCourseAdmin = () => {
  // const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const apiUrl = API_URL;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const departments = useSelector((state) => state.myReducer.departments);

  const fetchData = () => {
    setLoading(true);
    fetch(`${apiUrl}/get-completed-course-users`)
      .then((res) => res.json())
      .then((res) => {
        if (res.result) {
          setData(res.result);
        } else {
          message.warning("No completed users found.");
          setData([]);
        }
      })
      .catch(() => {
        message.error("Failed to fetch completed course users.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const issueCertificate = (record) => {
    fetch(`${apiUrl}/issue-certificate/${record._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.result) {
          message.success("Certificate issued successfully!");
          setSelectedRecord(res.result);
          setModalVisible(true);
          fetchData(); // Refresh table to update status
        } else {
          message.error("Failed to issue certificate.");
        }
      })
      .catch(() => {
        message.error("Server error while issuing certificate.");
      });
  };

  const downloadCertificate = () => {
    const printContents = document.getElementById("certificate-preview").innerHTML;
    const newWindow = window.open("", "_blank");
    newWindow.document.write(`
      <html>
        <head><title>Certificate</title></head>
        <body>${printContents}</body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print();
  };

  const columns = [
    {
      title: "Student Name",
      dataIndex: ["user", "name"],
    },
    {
      title: "Student Email",
      dataIndex: ["user", "email"],
    },
    {
      title: "Department",
      render(item) {
        const dept = departments?.find((d) => d.value == item.course.department);
        return dept ? dept.name : "";
      },
    },
    {
      title: "Course Title",
      dataIndex: ["course", "title"],
    },
    {
      title: "Course ID",
      dataIndex: ["course", "id"],
    },
    {
      title: "Completed On",
      render(item) {
        return item.completedAt
          ? new Date(item.completedAt).toLocaleDateString()
          : "";
      },
    },
  ];

  return (
    <div className="w-100">
      <h5 className="text-center">Completed Course Students</h5>
      <AntdTable columns={columns} data={data} width="80%" loading={loading} />
    </div>
  );
};

export default CompletedCourseAdmin;
