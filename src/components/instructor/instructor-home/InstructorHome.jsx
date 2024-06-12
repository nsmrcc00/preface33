import InstructorHeader from "../../header/InstructorHeader";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, getDocs, doc } from "firebase/firestore";
import { useAuth } from "../../../contexts/authContext";
import { db } from "../../../firebase/firebase";
import { doSignOut } from "../../../firebase/auth";

const InstructorHome = () => {
  const { currentUser, userLoggedIn } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      if (currentUser) {
        try {
          const userDoc = doc(db, "Users", currentUser.uid);
          const subjectsCollection = collection(userDoc, "subjectsHandled");
          const subjectsSnapshot = await getDocs(subjectsCollection);
          const subjectsList = subjectsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setSubjects(subjectsList);
        } catch (error) {
          console.error("Error fetching subjects:", error);
        }
      }
    };

    fetchSubjects();
  }, [currentUser]);

  const handleSubjectClick = (subjectId) => {
    if (userLoggedIn) {
      navigate(`/subject/${subjectId}`);
    } else {
      doSignOut();
      navigate("/login");
    }
  };

  return (
    <>
      <header>
        <InstructorHeader />
      </header>
      <main className="subjectsPage">
        <section className="instructorPage">
          {subjects.map((subject) => (
            <div
              className="subject-dash-div"
              key={subject.id}
              onClick={() => handleSubjectClick(subject.id)}
            >
              <p>{subject.title}</p>
              <p>Code: {subject.subjectCode}</p>
              <p>Section: {subject.section}</p>
            </div>
          ))}
        </section>
        <aside className="instructorNotifications">
          <h2>Notifications</h2>
          <div>PLACEHOLDER</div>
          <div>PLACEHOLDER</div>
          <div>PLACEHOLDER</div>
        </aside>
      </main>
    </>
  );
};

export default InstructorHome;
