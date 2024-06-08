import InstructorHeader from "../../header/InstructorHeader"
import Modal from "react-modal"
import { useState } from "react";
import { useAuth } from "../../../contexts/authContext";
import { doSignOut } from "../../../firebase/auth";
import { useNavigate } from "react-router-dom";

Modal.setAppElement("#root");


const SubjectHome = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();
  const [modalIsOpen, setModalIsOpen] = useState(false);

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

  return (
    <>
      <header>
        <InstructorHeader/>
      </header>
      <main>
        <section>
          <h1>Subject Name - Section</h1>
          <button onClick={openModal}>Button (Kunyari sa calendar pumindot)</button>
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
            <h2>Subject Name Class List</h2>
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
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr onClick={navi2}>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
      </Modal>      
    </>
  )
}

export default SubjectHome
