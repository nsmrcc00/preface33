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

const localizer = momentLocalizer(moment);
Modal.setAppElement("#root");

const CustomToolbar = ({ label, onNavigate }) => (
  <div className="calendar-toolbar">
    <h3 className="toolbar-label">{label}</h3>
    <button
      className="calendar-toolbar-btn"
      onClick={() => onNavigate("TODAY")}
    >
      Today
    </button>
    <button className="calendar-toolbar-btn" onClick={() => onNavigate("PREV")}>
      Previous
    </button>
    <button className="calendar-toolbar-btn" onClick={() => onNavigate("NEXT")}>
      Next
    </button>
  </div>
);

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

  useEffect(() => {
    if (modalIsOpen) {
      document.body.classList.add("hide-rbc-button-link");
    } else {
      document.body.classList.remove("hide-rbc-button-link");
    }
    return () => {
      document.body.classList.remove("hide-rbc-button-link");
    };
  }, [modalIsOpen]);

  const handleSelectSlot = ({ start }) => {
    console.log("Slot selected:", start);
    setSelectedDate(start);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    console.log("Modal closed");
    setModalIsOpen(false);
    setSelectedDate(null);
  };

  const afterOpenModal = () => {
    console.log("Modal opened");
    const modalElement = document.querySelector(".ReactModal__Content");
    if (modalElement) {
      modalElement.focus();
    }
  };

  const afterCloseModal = () => {
    console.log("Modal after close");
    if (calendarRef.current) {
      calendarRef.current.focus();
    }
  };

  const navi2 = (studentId, subjectDocId) => {
    console.log("Navigating to student profile:", studentId);
    if (userLoggedIn === true) {
      navigate(`/student-profile/${studentId}`, { state: { subjectDocId } });
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
      const classListData = [];

      for (const subjectDoc of querySnapshot.docs) {
        const subjectDocId = subjectDoc.id;
        const classListRef = collection(subjectDoc.ref, "classList");
        const classListSnapshot = await getDocs(classListRef);

        for (const studentDoc of classListSnapshot.docs) {
          const studentData = {
            id: studentDoc.id,
            ...studentDoc.data(),
            subjectDocId,
          };
          const attendanceLedgerRef = collection(
            studentDoc.ref,
            "attendanceLedger"
          );
          const attendanceDocId = moment(selectedDate).format("MMMM D, YYYY");
          const attendanceDocRef = doc(attendanceLedgerRef, attendanceDocId);
          const attendanceDocSnapshot = await getDoc(attendanceDocRef);

          if (attendanceDocSnapshot.exists()) {
            const attendanceData = attendanceDocSnapshot.data();
            studentData.attendance = {
              in: attendanceData.attendanceIn?.In || false,
              inTimestamp: attendanceData.attendanceIn?.timestamp || null,
              out: attendanceData.attendanceOut?.Out || false,
              outTimestamp: attendanceData.attendanceOut?.timestamp || null,
              status: attendanceData.status || "--",
            };
          } else {
            studentData.attendance = {
              in: false,
              inTimestamp: null,
              out: false,
              outTimestamp: null,
              status: "--",
            };
          }

          classListData.push(studentData);
        }
      }
      console.log("Class list data:", classListData);
      setClassList(classListData);
      setFilteredClassList(classListData);
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

  const startTimer = (duration) => {
    setTimer(duration);
    setTimerRunning(true);
    timerIntervalRef.current = setInterval(() => {
      setTimer((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerIntervalRef.current);
          setTimerRunning(false);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerIntervalRef.current);
    setTimerRunning(false);
    setTimer(null);
  };

  const formatTimer = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleStartAttendanceIn = async () => {
    if (!selectedDate) {
      console.log("No selected date");
      return;
    }

    const formattedDate = moment(selectedDate).format("MMMM D, YYYY");
    console.log("Starting attendance in for date:", formattedDate);

    for (const student of classList) {
      console.log("Processing student:", student.id);
      const attendanceLedgerRef = collection(
        doc(db, "Subjects", student.subjectDocId),
        "classList",
        student.id,
        "attendanceLedger"
      );
      const attendanceDocRef = doc(attendanceLedgerRef, formattedDate);

      await setDoc(attendanceDocRef, {
        attendanceIn: {
          In: false,
          timestamp: null,
          accessible: true,
        },
        status: "Absent",
      });
      console.log("Attendance in recorded for student:", student.id);

      // Set a timeout to update the 'accessible' field to false after 5 minutes
      setTimeout(async () => {
        await setDoc(attendanceDocRef, {
          attendanceIn: {
            accessible: false,
          },
        }, { merge: true });
        console.log("Updated accessible to false for student:", student.id);
      }, 300000); // 5 minutes
    }

    // Start the 5-minute timer
    startTimer(300);
  };

  const handleStartAttendanceOut = async () => {
    if (!selectedDate) {
      console.log("No selected date");
      return;
    }

    const formattedDate = moment(selectedDate).format("MMMM D, YYYY");
    console.log("Starting attendance out for date:", formattedDate);

    for (const student of classList) {
      console.log("Processing student:", student.id);
      const attendanceLedgerRef = collection(
        doc(db, "Subjects", student.subjectDocId),
        "classList",
        student.id,
        "attendanceLedger"
      );
      const attendanceDocRef = doc(attendanceLedgerRef, formattedDate);

      await setDoc(attendanceDocRef, {
        attendanceOut: {
          Out: false,
          timestamp: null,
          accessible: true,
        },
      }, { merge: true });
      console.log("Attendance out recorded for student:", student.id);

      // Set a timeout to update the 'accessible' field to false after 5 minutes
      setTimeout(async () => {
        await setDoc(attendanceDocRef, {
          attendanceOut: {
            accessible: false,
          },
        }, { merge: true });
        console.log("Updated accessible to false for student:", student.id);
      }, 300000); // 5 minutes
    }

    // Start the 5-minute timer
    startTimer(300);
  };

  const handleStatusChange = async (event, student) => {
    const newStatus = event.target.value;
    const formattedDate = moment(selectedDate).format("MMMM D, YYYY");
    const attendanceLedgerRef = collection(
      doc(db, "Subjects", student.subjectDocId),
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

  return (
    <>
      <header>
        <InstructorHeader />
      </header>
      <main className="subject-home">
        <section className="subject-home-container">
          {subject && (
            <>
              <h1>
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
        onAfterOpen={afterOpenModal}
        onAfterClose={afterCloseModal}
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
            >
              Start Attendance In
            </button>
            <button
              className="calendar-modal"
              onClick={handleStartAttendanceOut}
            >
              Start Attendance Out
            </button>            
            {timerRunning && (
              <>
                <button
                  className="calendar-modal"
                  onClick={stopTimer}
                >
                  Stop Timer
                </button>
                <div className="timer">
                  Time remaining: {timer} seconds
                </div>
              </>              
            )}
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
              {filteredClassList.map((student, index) => (
                <tr key={index}>
                  <td>{student.name}</td>
                  <td>{student.section}</td>
                  <td>
                    {student.attendance.in
                      ? moment(student.attendance.inTimestamp.toDate()).format(
                          "hh:mm A"
                        )
                      : "--"}
                  </td>
                  <td>
                    {student.attendance.out
                      ? moment(student.attendance.outTimestamp.toDate()).format(
                          "hh:mm A"
                        )
                      : "--"}
                  </td>
                  <td>
                    <select
                      value={student.attendance.status}
                      onChange={(event) => handleStatusChange(event, student)}
                    >
                      <option value="--">--</option>
                      <option value="Present">Present</option>
                      <option value="Late">Late</option>
                      <option value="Absent">Absent</option>
                      <option value="Excused">Excused</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => navi2(student.id, student.subjectDocId)}
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  );
};

export default SubjectHome;
