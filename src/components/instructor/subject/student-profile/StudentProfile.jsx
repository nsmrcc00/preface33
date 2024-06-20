import InstructorHeader from "../../../header/InstructorHeader";
import { useParams, useLocation } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";
import { useState, useEffect } from "react";
import moment from "moment";

const StudentProfile = () => {
  const { studentId } = useParams();
  const location = useLocation();
  const { subjectDocId } = location.state || {}; // Provide a default value
  const [studentData, setStudentData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        if (!subjectDocId) {
          console.error("subjectDocId is missing");
          return;
        }

        console.log('Fetching student data for studentId:', studentId);
        const studentDoc = doc(db, "Subjects", subjectDocId, "classList", studentId);
        const studentSnapshot = await getDoc(studentDoc);
        if (studentSnapshot.exists()) {
          const studentData = studentSnapshot.data();
          console.log('Fetched student data:', studentData);
          setStudentData(studentData);

          // Fetch attendance data
          const attendanceLedgerRef = collection(studentDoc, "attendanceLedger");
          const attendanceLedgerSnapshot = await getDocs(attendanceLedgerRef);
          const attendanceList = attendanceLedgerSnapshot.docs.map(doc => ({
            date: doc.id,
            status: doc.data().status
          }));

          console.log('Fetched attendance data:', attendanceList);
          setAttendanceData(attendanceList);
        } else {
          console.log('Student data not found');
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchStudentData();
  }, [studentId, subjectDocId]);

  if (!studentData) {
    return <div>Loading...</div>;
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Absent':
        return { color: 'red' };
      case 'Late':
        return { color: 'yellow' };
      case 'Present':
        return { color: 'green' };
      default:
        return {};
    }
  };

  return (
    <>
      <header>
        <InstructorHeader />
      </header>
      <main className="subject-home">
        <section className="subject-home-container">
          <div className="table-container">
            <h3>{studentData.name}'s Attendance</h3>
            <table className="striped-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((entry, index) => (
                  <tr key={index}>
                    <td>{moment(entry.date, "MMMM D, YYYY").format("MMMM D, YYYY")}</td>
                    <td style={getStatusStyle(entry.status)}>{entry.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>                                   
          </div>
          
        </section>
        <section className="subject-home-container">
          <div id="attendanceTotal" className="table-container">
            <div className="attendanceTotalContent">
              <p>Total days attended:</p>
              <p>{attendanceData.filter(entry => entry.status === 'Present' || entry.status === 'Late').length}</p>
            </div>
            <div className="attendanceTotalContent">
              <p>Total number of absences:</p>
              <p>{attendanceData.filter(entry => entry.status === 'Absent').length}/3</p>
            </div>
          </div>          
        </section>
      </main>
    </>
  );
};

export default StudentProfile;