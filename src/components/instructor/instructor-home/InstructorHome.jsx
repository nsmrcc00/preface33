import InstructorHeader from '../../header/InstructorHeader';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, getDocs, doc } from 'firebase/firestore';
import { useAuth } from '../../../contexts/authContext';
import { db } from '../../../firebase/firebase';
import { doSignOut } from '../../../firebase/auth';

const InstructorHome = () => {
  const { currentUser, userLoggedIn } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();

  const navi1 = () => {
    if (userLoggedIn === true) {
      navigate('/subject');
    } else {
      doSignOut();
      navigate('/login');
    }
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      if (currentUser) {
        const cachedSubjects = localStorage.getItem('cachedSubjects');
        const cacheExpiration = localStorage.getItem('cacheExpiration');
        
        if (cachedSubjects && cacheExpiration && new Date() < new Date(cacheExpiration)) {
          setSubjects(JSON.parse(cachedSubjects));
        } else {
          const userDoc = doc(db, 'Users', currentUser.uid);
          const subjectsCollection = collection(userDoc, 'subjectsHandled');
          const subjectsSnapshot = await getDocs(subjectsCollection);
          const subjectsList = subjectsSnapshot.docs.map(doc => doc.data());
          
          setSubjects(subjectsList);
          localStorage.setItem('cachedSubjects', JSON.stringify(subjectsList));
          localStorage.setItem('cacheExpiration', new Date(new Date().getTime() + 60 * 60 * 1000)); // Cache for 1 hour
        }
      }
    };

    fetchSubjects();
  }, [currentUser]);

  return (
    <>
      <header>
        <InstructorHeader />
      </header>
      <main className='subjectsPage'>
        <section className='instructorPage'>
          {subjects.map((subject, index) => (
            <div className="subject-dash-div" key={index} onClick={navi1}>
              <p>{subject.title}</p>
              <p>Code: {subject.subjectCode}</p>
              <p>Section: {subject.section}</p>
            </div>
          ))}
        </section>
        <aside className='instructorNotifications'>
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
