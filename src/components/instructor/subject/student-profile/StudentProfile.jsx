import InstructorHeader from "../../../header/InstructorHeader";
import { useParams, useLocation } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import moment from "moment";
import { Spinner } from "react-bootstrap";

const StudentProfile = () => {
  const { studentId } = useParams();
  const location = useLocation();
  const { subjectId } = location.state || {}; // Provide a default value
  const [studentData, setStudentData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [subjectTitle, setSubjectTitle] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        if (!subjectId) {
          console.error("subjectDocId is missing");
          return;
        }

        console.log('Fetching student data for studentId:', studentId);
        const subjectDoc = doc(db, "Subjects", subjectId);
        const subjectSnapshot = await getDoc(subjectDoc);

        if (subjectSnapshot.exists()) {
          const subjectData = subjectSnapshot.data();
          const title = subjectData.title;
          setSubjectTitle(title);
          console.log('Fetched subject title:', title);

          const studentDoc = doc(db, "Subjects", subjectId, "classList", studentId);
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
        } else {
          console.log('Subject data not found');
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchStudentData();
  }, [studentId, subjectId]);

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
  
        if (user) {
          const userDoc = doc(db, "Users", user.uid);
          const userSnapshot = await getDoc(userDoc);
  
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            setUserEmail(userData.email); // Assuming email field is stored as "email"
            console.log('Fetched user email:', userData.email);
          } else {
            console.log('User data not found');
          }
        } else {
          console.log('No user is signed in');
        }
      } catch (error) {
        console.error("Error fetching user email:", error);
      }
    };
  
    fetchUserEmail();
  }, []);

  if (!studentData) {
    return (
      <>
        <div className="loading-screen">
        <h2>Loading Attendance Record</h2>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        </div>
      </>
    );
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

  const sendNotificationToStudents = async (title, body) => {
    if (studentData && studentData.fcmToken) {
      const tokens = [studentData.fcmToken]; // Wrap in an array for the API
      console.log("Sending notification to tokens:", tokens);

      try {
        const response = await fetch("https://asia-southeast1-***REMOVED***.cloudfunctions.net/sendNotification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tokens: tokens,
            title: title,
            body: body,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log("Notification sent:", data);
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    } else {
      console.log("No FCM token available for sending notifications.");
    }
  };

  const absenceCount = attendanceData.filter(entry => entry.status === 'Absent').length;

  return (
    <>
      <header>
        <InstructorHeader />
      </header>

      <div className="cdspHeader">
        <img 
          src="/cdspLogo.png"
          alt="CDSP"
          width={54}
          height={54}
        />    
        <div className="cdspHeaderText">
          <h4>COLEGIO DE SAN PEDRO, INC</h4>
          <p>Phase 1A Pacita Complex I, San Pedro, Laguna</p>
          <p>Information Technology Education Department</p>
        </div>
      </div>       

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
              <p>{absenceCount}/3</p>
            </div>
            <div className="attendanceTotalContent">
              <button  onClick={window.print}>Print Report</button>
              {absenceCount >= 3 && (
                <button onClick={() => sendNotificationToStudents("Attendance Warning", `You have accumulated ${absenceCount} absences in ${subjectTitle}. Please contact your instructor at ${userEmail} for further instructions.`)}>Notify Student</button>
              )} 
            </div>              
                   
          </div>
        </section>
      </main>
    </>
  );
};

export default StudentProfile;
