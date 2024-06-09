import InstructorHeader from "../../header/InstructorHeader";
import Modal from "react-modal";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../contexts/authContext";
import { doSignOut } from "../../../firebase/auth";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
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
    <button className="calendar-toolbar-btn" onClick={() => onNavigate("TODAY")}>Today</button>
    <button className="calendar-toolbar-btn" onClick={() => onNavigate("PREV")}>Previous</button>
    <button className="calendar-toolbar-btn" onClick={() => onNavigate("NEXT")}>Next</button>
  </div>
);

const SubjectHome = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const { userLoggedIn, currentUser } = useAuth();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [subject, setSubject] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState("month"); // Manage the view state
  const calendarRef = useRef(null);

  useEffect(() => {
    // Toggle class on the body or another appropriate parent element
    if (modalIsOpen) {
      document.body.classList.add("hide-rbc-button-link");
    } else {
      document.body.classList.remove("hide-rbc-button-link");
    }

    // Cleanup function to remove the class if the component unmounts
    return () => {
      document.body.classList.remove("hide-rbc-button-link");
    };
  }, [modalIsOpen]);

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedDate(null);
  };

  const afterOpenModal = () => {
    // Transfer focus to the modal
    const modalElement = document.querySelector(".ReactModal__Content");
    if (modalElement) {
      modalElement.focus();
    }
  };

  const afterCloseModal = () => {
    // Restore focus to the calendar
    if (calendarRef.current) {
      calendarRef.current.focus();
    }
  };

  const navi2 = () => {
    if (userLoggedIn === true) {
      navigate("/student-profile");
    } else {
      doSignOut();
      navigate("/login");
    }
  };

  useEffect(() => {
    const fetchSubject = async () => {
      if (currentUser) {
        const userDoc = doc(db, "Users", currentUser.uid);
        const subjectDoc = doc(userDoc, "subjectsHandled", subjectId);
        const subjectSnapshot = await getDoc(subjectDoc);

        if (subjectSnapshot.exists()) {
          setSubject(subjectSnapshot.data());
        }
      }
    };

    fetchSubject();
  }, [currentUser, subjectId]);

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
                    view={view} // Set the view state
                    onView={() => setView("month")} // Prevent view changes
                    selectable // Allow selecting a slot
                    onSelectSlot={handleSelectSlot} // Handle slot selection
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
            <input type="text" placeholder="Search" className="calendar-modal" />
            <button className="calendar-modal">Start Attendance In</button>
            <button className="calendar-modal">Start Attendance Out</button>
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
              <tr>
                <td>Student Name</td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <select>
                    <option>--</option>
                    <option>Present</option>
                    <option>Late</option>
                    <option>Absent</option>
                    <option>Excused</option>
                  </select>
                </td>
                <td>
                  <button onClick={navi2}>View Profile</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  );
};

export default SubjectHome;
