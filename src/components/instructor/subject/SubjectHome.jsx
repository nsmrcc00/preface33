import InstructorHeader from "../../header/InstructorHeader";
import Modal from "react-modal";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../contexts/authContext";
import { doSignOut } from "../../../firebase/auth";
import { useNavigate, useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../subject/SubCalendar.css";
import * as XLSX from 'xlsx';

const localizer = momentLocalizer(moment);
Modal.setAppElement("#root");

const CustomToolbar = ({ label, onNavigate }) => (
  <div className="calendar-toolbar">
    <h3 className="toolbar-label">{label}</h3>
    {["TODAY", "PREV", "NEXT"].map((action) => (
      <button key={action} className="calendar-toolbar-btn" onClick={() => onNavigate(action)}>
        {action.charAt(0) + action.slice(1).toLowerCase()}
      </button>
    ))}
  </div>
);

const isDateInSchedule = (date, schedule) => {
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const selectedDayName = dayNames[date.getDay()];
  const scheduleDays = schedule.days.split(",");
  return scheduleDays.includes(selectedDayName);
};

const isTimeInSchedule = (date, schedule) => {
  const [start, end] = schedule.time.split("-");
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const startDateTime = new Date(date);
  startDateTime.setHours(startHour, startMinute, 0, 0);

  const endDateTime = new Date(date);
  endDateTime.setHours(endHour, endMinute, 0, 0);

  return date >= startDateTime && date <= endDateTime;
};

const SubjectHome = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const { userLoggedIn, currentUser } = useAuth();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [subject, setSubject] = useState(null);
  const [classList, setClassList] = useState([]);
  const [filteredClassList, setFilteredClassList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [timer, setTimer] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [view, setView] = useState("month");
  const calendarRef = useRef(null);
  const [numStudents, setNumStudents] = useState(0);
  const [numPresent, setNumPresent] = useState(0);
  const [numAbsent, setNumAbsent] = useState(0);
  const timerIntervalRef = useRef(null);
  const [attendanceInStarted, setAttendanceInStarted] = useState(false);
  const [attendanceOutStarted, setAttendanceOutStarted] = useState(false);
  const [loading, setLoading] = useState(true); // New loading state


  useEffect(() => {
    document.body.classList.toggle("hide-rbc-button-link", modalIsOpen);
    return () => document.body.classList.remove("hide-rbc-button-link");
  }, [modalIsOpen]);

  const handleSelectSlot = ({ start }) => {
    console.log("Slot selected:", start);
    if (subject && isDateInSchedule(start, subject.Schedule)) {
      setSelectedDate(start);
      setModalIsOpen(true);
    } else {
      alert("You can only monitor the attendance on scheduled days.");
    }
  };

  const closeModal = () => {
    console.log("Modal closed");
    setModalIsOpen(false);
    setSelectedDate(null);
  };

  const navi2 = (studentId) => {
    console.log("Navigating to student profile:", studentId);
    if (userLoggedIn === true) {
      navigate(`/student-profile/${studentId}`, { state: { subjectId } });
    } else {
      doSignOut();
      navigate("/login");
    }
  };
  
  const fetchClassList = (subjectTitle, subjectSection) => {
    console.log("Fetching class list for:", subjectTitle, subjectSection);
    const subjectsRef = collection(db, "Subjects");
    const q = query(
      subjectsRef,
      where("title", "==", subjectTitle),
      where("section", "==", subjectSection)
    );
  
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const classListDataPromises = querySnapshot.docs.map(async (subjectDoc) => {
        const subjectId = subjectDoc.id;
        const classListRef = collection(subjectDoc.ref, "classList");
        const classListSnapshot = await getDocs(classListRef);
        
        return Promise.all(classListSnapshot.docs.map(async (studentDoc) => {
          const studentData = {
            id: studentDoc.id,
            ...studentDoc.data(),
            subjectId,
            attendance: {
              in: false,
              inTimestamp: null,
              out: false,
              outTimestamp: null,
              status: "--",
            }
          };
          const attendanceLedgerRef = collection(
            studentDoc.ref,
            "attendanceLedger"
          );
          const attendanceDocId = moment(selectedDate).format("MMMM D, YYYY");
          const attendanceDocRef = doc(attendanceLedgerRef, attendanceDocId);
          
          const unsubscribeAttendance = onSnapshot(attendanceDocRef, (attendanceDocSnapshot) => {
            if (attendanceDocSnapshot.exists()) {
              const attendanceData = attendanceDocSnapshot.data();
              studentData.attendance = {
                in: attendanceData.attendanceIn?.In || false,
                inTimestamp: attendanceData.attendanceIn?.timestamp ? attendanceData.attendanceIn.timestamp.toDate() : null,
                out: attendanceData.attendanceOut?.Out || false,
                outTimestamp: attendanceData.attendanceOut?.timestamp ? attendanceData.attendanceOut.timestamp.toDate() : null,
                status: attendanceData.status || "--",
              };
            }
            setClassList((prevClassList) =>
              prevClassList.map((item) =>
                item.id === studentData.id ? studentData : item
              )
            );
            setFilteredClassList((prevFilteredList) =>
              prevFilteredList.map((item) =>
                item.id === studentData.id ? studentData : item
              )
            );
          });
          return studentData;
        }));
      });
  
      const classListData = await Promise.all(classListDataPromises).then(results => results.flat());
      console.log("Class list data:", classListData);
      setClassList(classListData);
      setFilteredClassList(classListData);
      setLoading(false);
    });
  
    return unsubscribe; // Return the unsubscribe function to clean up the listener
  };
  
  useEffect(() => {
    const fetchSubject = async () => {
      console.log("Fetching subject");
      if (currentUser) {
        const userDoc = doc(db, "Users", currentUser.uid);
        const subjectDoc = doc(userDoc, "subjectsHandled", subjectId);
        const subjectSnapshot = await getDoc(subjectDoc);

        if (subjectSnapshot.exists()) {
          const subjectData = subjectSnapshot.data();
          setSubject(subjectData);

          const unsubscribe = fetchClassList(subjectData.title, subjectData.section);
          return () => unsubscribe(); // Clean up the listener when component unmounts
        }
      }
    };

    fetchSubject();
  }, [currentUser, subjectId, selectedDate]);

  useEffect(() => {
    const totalStudents = filteredClassList.length;
    const presentStudents = filteredClassList.filter(student => student.attendance.status === "Present").length;
    const absentStudents = filteredClassList.filter(student => student.attendance.status === "Absent").length;

    setNumStudents(totalStudents);
    setNumPresent(presentStudents);
    setNumAbsent(absentStudents);
  }, [filteredClassList]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    console.log("Search query:", query);
    setSearchQuery(query);

    if (query === "") {
      setFilteredClassList(classList);
    } else {
      const filteredList = classList.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.section.toLowerCase().includes(query) ||
          student.attendance.status.toLowerCase().includes(query)
      );
      setFilteredClassList(filteredList);
    }
  };

  const sendNotificationToStudents = async (title, body) => {
    const tokens = classList.map(student => student.fcmToken).filter(token => token);
  
    if (tokens.length > 0) {
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
      console.log("No FCM tokens available for sending notifications.");
    }
  };
  

  const startTimer = (duration, onEndCallback) => {
    // Clear any existing interval
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  
    setTimer(duration);
    setTimerRunning(true);
    timerIntervalRef.current = setInterval(() => {
      setTimer((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerIntervalRef.current);
          setTimerRunning(false);
          if (onEndCallback) {
            onEndCallback();
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };
  

  const stopTimer = async () => {
    clearInterval(timerIntervalRef.current);
    setTimerRunning(false);
    setTimer(null);

    if (attendanceInStarted || attendanceOutStarted) {
      const formattedDate = moment(selectedDate).format("MMMM D, YYYY");
      const updateAttendance = async (studentId, attendanceType) => {
        await setDoc(
          doc(collection(doc(db, "Subjects", subjectId), "classList", studentId, "attendanceLedger"), formattedDate),
          { [attendanceType]: { accessible: false } },
          { merge: true }
        );
      };
      for (const student of classList) {
        if (attendanceInStarted) await updateAttendance(student.id, "attendanceIn");
        if (attendanceOutStarted) await updateAttendance(student.id, "attendanceOut");
      }

      if (attendanceInStarted) sendNotificationToStudents("Attendance In", `Attendance in process has ended for ${subject.title}.`);
      if (attendanceOutStarted) sendNotificationToStudents("Attendance Out", `Attendance out process has ended for ${subject.title}.`);

      setAttendanceInStarted(false);
      setAttendanceOutStarted(false);
    }
  };
    
  const formatTimer = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSetAllStatus = async (e) => {
    const selectedStatus = e.target.value;
    const formattedDate = moment(selectedDate).format("MMMM D, YYYY");

    for (const student of classList) {
      const attendanceLedgerRef = collection(
        doc(db, "Subjects", student.subjectId),
        "classList",
        student.id,
        "attendanceLedger"
      );
      const attendanceDocRef = doc(attendanceLedgerRef, formattedDate);
      await setDoc(
        attendanceDocRef,
        {
          status: selectedStatus,
        },
        { merge: true }
      );
    }

    // Update the status in the local state
    const updatedClassList = classList.map(student => ({
      ...student,
      attendance: {
        ...student.attendance,
        status: selectedStatus
      }
    }));
    setClassList(updatedClassList);
    setFilteredClassList(updatedClassList);
  };

  const handleStartAttendanceIn = async () => {
    if (!selectedDate) return;
    const formattedDate = moment(selectedDate).format("MMMM D, YYYY");
    const week = moment(selectedDate).isoWeek();
    const dayOfWeek = moment(selectedDate).day(); // Get the day of the week (0-6)
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const humanReadableDay = dayNames[dayOfWeek]; // Get human-readable day name
  
    for (const student of classList) {
      console.log("Processing student:", student.id);
      await setDoc(
        doc(collection(doc(db, "Subjects", student.subjectId), "classList", student.id, "attendanceLedger"), formattedDate),
        {
          attendanceIn: { 
            In: false, 
            timestamp: null, 
            accessible: true 
          }, 
            status: "--", 
            week: week, 
            dayOfWeek: dayOfWeek, // Add the day of the week (numerical value)
            day: humanReadableDay, // Add the human-readable day of the week          
          },
        { merge: true }
      );    
    }    
    setAttendanceInStarted(true);
    startTimer(300, async () => {
      for (const student of classList) {
        await setDoc(
          doc(collection(doc(db, "Subjects", student.subjectId), "classList", student.id, "attendanceLedger"), formattedDate),
          { attendanceIn: { accessible: false } },
          { merge: true }
        );
        console.log("Updated accessible to false for student:", student.id);
      }
    });
    console.log(`Attendance in process has started for ${subject.title}. Please mark your attendance.`);
    sendNotificationToStudents("Attendance In", `Attendance in process has started for ${subject.title}. Please mark your attendance.`);
  };

  const handleStartAttendanceOut = async () => {
    if (!selectedDate) return;
    const formattedDate = moment(selectedDate).format("MMMM D, YYYY");

    for (const student of classList) {
      await setDoc(
        doc(collection(doc(db, "Subjects", student.subjectId), "classList", student.id, "attendanceLedger"), formattedDate),
        { attendanceOut: { Out: false, timestamp: null, accessible: true } },
        { merge: true }
      );      
    }
    setAttendanceOutStarted(true);
    startTimer(300, async () => {
      for (const student of classList) {
        await setDoc(
          doc(collection(doc(db, "Subjects", student.subjectId), "classList", student.id, "attendanceLedger"), formattedDate),
          { attendanceOut: { accessible: false } },
          { merge: true }
        );
        console.log("Updated accessible to false for student:", student.id);
      }
    });
    console.log(`Attendance out process has started for ${subject.title}. Please mark your attendance.`);
    sendNotificationToStudents("Attendance Out", `Attendance out process has started for ${subject.title}. Please mark your attendance.`);
  };

  const handleStatusChange = async (event, student) => {
    const newStatus = event.target.value;
    const formattedDate = moment(selectedDate).format("MMMM D, YYYY");
    const attendanceLedgerRef = collection(
      doc(db, "Subjects", student.subjectId),
      "classList",
      student.id,
      "attendanceLedger"
    );
    const attendanceDocRef = doc(attendanceLedgerRef, formattedDate);

    await setDoc(attendanceDocRef, {
      status: newStatus,
    }, { merge: true });

    setClassList(prevClassList =>
      prevClassList.map(item =>
        item.id === student.id
          ? { ...item, attendance: { ...item.attendance, status: newStatus } }
          : item
      )
    );

    setFilteredClassList(prevFilteredList =>
      prevFilteredList.map(item =>
        item.id === student.id
          ? { ...item, attendance: { ...item.attendance, status: newStatus } }
          : item
      )
    );
  };

  const currentTime = new Date();
  const isWithinSchedule = subject && selectedDate && isDateInSchedule(selectedDate, subject.Schedule) && isTimeInSchedule(currentTime, subject.Schedule);

  const exportToExcel = () => {
    const worksheetData = filteredClassList.map(student => ({
      "Name": student.name,
      "Section": student.section,
      "Time In": student.attendance.inTimestamp ? student.attendance.inTimestamp.toLocaleString() : "",
      "Time Out": student.attendance.outTimestamp ? student.attendance.outTimestamp.toLocaleString() : "",
      "Attendance Status": student.attendance.status,
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, `Attendance_${moment(selectedDate).format("MMMM_D_YYYY")}.xlsx`);
  };

  return (
    <>
      <header>
        <InstructorHeader />
      </header>
      <main className="subject-home">
        <section className="subject-home-container">
          {subject && (
            <>
              <h1 className="subject-home-heading">
                {subject.title} - {subject.section}
              </h1>
              <div className="table-container">
                <div style={{ height: 500 }} ref={calendarRef} tabIndex={-1}>
                  <Calendar
                    localizer={localizer}
                    events={[]}
                    startAccessor="start"
                    endAccessor="end"
                    defaultDate={moment().toDate()}
                    view={view}
                    onView={() => setView("month")}
                    selectable
                    onSelectSlot={handleSelectSlot}
                    components={{
                      toolbar: CustomToolbar,
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </section>
      </main>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Attendance"
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            borderRadius: "10px",
            width: "max(90%, 80%)",
            overflowX: "auto",
            maxHeight: "90vh",
          },
        }}
      >
        <div className="table-container">
          <h2>{subject ? subject.title : "Loading..."} Class List</h2>
          <div className="filter-sub-info">
            <p>Selected Date: {moment(selectedDate).format("MMMM Do YYYY")}</p>
            <p>|</p>
            <p>Number of Students: {numStudents}</p>
            <p>|</p>
            <p>Students Present: {numPresent}</p>
            <p>|</p>
            <p>Students Absent: {numAbsent}</p>
          </div>          
          <div className="filter-sub">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearch}
              className="calendar-modal"
            />
            <button
              className="calendar-modal"
              onClick={handleStartAttendanceIn}
              disabled={!isWithinSchedule}
            >
              Start Attendance In
            </button>
            <button
              className="calendar-modal"
              onClick={handleStartAttendanceOut}
              disabled={!isWithinSchedule}
            >
              Start Attendance Out
            </button>
            <select
              className="calendar-modal"
              onChange={handleSetAllStatus} 
              defaultValue=""
              disabled={!isWithinSchedule}
            >
              <option value="" disabled>Set all status to...</option>
              <option value="--">--</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Excused">Excused</option>
            </select>
            {timerRunning && (
              <>
                <button
                  className="calendar-modal"
                  onClick={stopTimer}
                >
                  Stop Timer
                </button>
                <div className="timer">
                  Time remaining: {formatTimer(timer)}
                </div>
              </>              
            )}
            <button className="calendar-modal" onClick={exportToExcel}>Print Report</button>
          </div>
          <table className="striped-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Section</th>
                <th>Time IN</th>
                <th>Time OUT</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="empty-data">
                    <span>Loading...</span>              
                </td>
              </tr>
            ) : filteredClassList.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-data">

                    <span>No students found.</span>

                </td>
              </tr>
              ) : (
              filteredClassList.map((student, index) => (
                <tr key={index}>
                  <td>{student.name}</td>
                  <td>{student.section}</td>
                  <td>
                    {student.attendance.inTimestamp
                      ? moment(student.attendance.inTimestamp).format("hh:mm A")
                      : "--"}
                  </td>
                  <td>
                    {student.attendance.outTimestamp
                      ? moment(student.attendance.outTimestamp).format("hh:mm A")
                      : "--"}
                  </td>
                  <td>
                    <select
                      value={student.attendance.status}
                      onChange={(event) => handleStatusChange(event, student)}
                    >
                      <option value="--">--</option>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Excused">Excused</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => navi2(student.id)}
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  );
};

export default SubjectHome;
