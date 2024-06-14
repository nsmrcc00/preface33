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
  const [view, setView] = useState("month");
  const calendarRef = useRef(null);

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

  const fetchClassList = async (subjectTitle, subjectSection) => {
    console.log("Fetching class list for:", subjectTitle, subjectSection);
    const subjectsRef = collection(db, "Subjects");
    const q = query(
      subjectsRef,
      where("title", "==", subjectTitle),
      where("section", "==", subjectSection)
    );
    const querySnapshot = await getDocs(q);
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

          await fetchClassList(subjectData.title, subjectData.section);
        }
      }
    };

    fetchSubject();
  }, [currentUser, subjectId, selectedDate]);

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
          In: null,
          timestamp: null,
        },
      });
      console.log("Attendance in recorded for student:", student.id);
    }

    // Optionally, you could fetch the class list again to update the UI.
    // await fetchClassList(subject.title, subject.section);
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

      // Update the document with attendanceOut field, if it already exists
      await setDoc(
        attendanceDocRef,
        {
          attendanceOut: {
            Out: null,
            timestamp: null,
          },
        },
        { merge: true } // Merge to ensure we don't overwrite existing fields
      );
      console.log("Attendance out recorded for student:", student.id);
    }

    // Optionally, you could fetch the class list again to update the UI.
    // await fetchClassList(subject.title, subject.section);
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
            width: "max(80%, 400px)",
            overflowX: "auto",
          },
        }}
      >
        <div className="table-container">
          <h2>{subject ? subject.title : "Loading..."} Class List</h2>
          <p>Selected Date: {moment(selectedDate).format("MMMM Do YYYY")}</p>
          <div>
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
                    <select value={student.attendance.status} readOnly>
                      <option>--</option>
                      <option>Present</option>
                      <option>Late</option>
                      <option>Absent</option>
                      <option>Excused</option>
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
