import InstructorHeader from "../../header/InstructorHeader";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, getDocs, doc } from "firebase/firestore";
import { useAuth } from "../../../contexts/authContext";
import { db } from "../../../firebase/firebase";
import { doSignOut } from "../../../firebase/auth";
import background from "/banner_1.jpg"

const InstructorHome = () => {
  const { currentUser, userLoggedIn } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      if (currentUser) {
        const cachedSubjects = localStorage.getItem('subjectDashDivs');
        if (cachedSubjects) {
          setSubjects(JSON.parse(cachedSubjects));
        } else {
          try {
            const userDoc = doc(db, "Users", currentUser.uid);
            const subjectsCollection = collection(userDoc, "subjectsHandled");
            const subjectsSnapshot = await getDocs(subjectsCollection);
            const subjectsList = subjectsSnapshot.docs
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
              .filter((subject) => !subject.archived);  // Filter out archived subjects
  
            localStorage.setItem('subjectDashDivs', JSON.stringify(subjectsList));
            setSubjects(subjectsList);
          } catch (error) {
            console.error("Error fetching subjects:", error);
          }
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
              {/*
              style={{ 
        backgroundImage: `url(${background})`,
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',                         
      }}
        */}
        <aside className="white-space"/>
        <section className="instructorPage">
          {subjects.map((subject) => (
            <div
              className="subject-dash-div"
              key={subject.id}
              onClick={() => handleSubjectClick(subject.id)}
            >
              <div className="subject-dash-div-content-container ">
                <p style={{fontWeight: "bold"}}>{subject.title}</p>
                <p>Code: {subject.subjectCode}</p>
                <p>Section: {subject.section}</p>
                {subject.Schedule && (
                  <>
                    <p>Days: {subject.Schedule.days}</p>
                    <p>Time: {subject.Schedule.time}</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </section>
        <aside className="white-space"/>
      </main>
    </>
  );
};

export default InstructorHome;
