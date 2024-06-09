import InstructorHeader from "../../header/InstructorHeader";
import Modal from "react-modal";
import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/authContext";
import { doSignOut } from "../../../firebase/auth";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import SubCalendar from "./SubCalendar";

Modal.setAppElement("#root");

const SubjectHome = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const { userLoggedIn, currentUser } = useAuth();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [subject, setSubject] = useState(null);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const navi2 = () => {
    if (userLoggedIn === true) {
      navigate('/student-profile');
    } else {
      doSignOut();
      navigate('/login');
    }
  };

  useEffect(() => {
    const fetchSubject = async () => {
      if (currentUser) {
        const userDoc = doc(db, 'Users', currentUser.uid);
        const subjectDoc = doc(userDoc, 'subjectsHandled', subjectId);
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
        <InstructorHeader/>
      </header>
      <main>
        <section>
          {subject && (
            <>
              <h1>{subject.title} - {subject.section}</h1>
              <SubCalendar/>
              <button onClick={openModal}>Button (Kunyari sa calendar pumindot)</button>
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
            width: "max(80%, 400px)",
            overflowX: "auto",
          },
        }}
      >
        <div className="table-container">
            <h2>{subject ? subject.title : "Loading..."} Class List</h2>
            <input
            type="text"
            placeholder="Search"          
            style={{
              margin: "0px 10px 10px 0px",
            }}
          />
            <table className="striped-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Section</th>
                  <th>Time IN</th>
                  <th>Time OUT</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td onClick={navi2}>Student Name</td>
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
                </tr>
              </tbody>
            </table>
          </div>
      </Modal>      
    </>
  );
};

export default SubjectHome;
