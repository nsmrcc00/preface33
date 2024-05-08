import React, { useState, useEffect } from 'react'
import { db } from '../../../firebase/firebase';

const AddSubject = () => {
    const [subjectData, setSubjectData] = useState({
        title: '',
        instructor: '',
        schedule: '',
      });
      const [subjects, setSubjects] = useState([])

      const handleSubmit = async (e) => {
        e.preventDefault();
        await db.collection('subject').add(subjectData);
        setSubjectData({ title: '', instructor: '', schedule: '' });
      };

      useEffect(() => {
        const unsubscribe = db.collection('subject').onSnapshot((snapshot) => {
          const subjectList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSubjects(subjectList);
        });
      
        return () => unsubscribe(); // Cleanup function to prevent memory leaks
      }, []);

    return (
        <div>
            {/* Form to capture subject data */}
            <input
                type="text"
                placeholder="Title"
                value={subjectData.title}
                onChange={(e) => setSubjectData({ ...subjectData, title: e.target.value })}
            />
            {/* ... (similar inputs for instructor and schedule) */}
            <button onClick={handleSubmit}>Add Subject</button>

            {/* Display a list of subjects (optional) */}
            {subjects.length > 0 && (
                <ul>
                {subjects.map((subject) => (
                    <li key={subject.id}>
                    {subject.title} - {subject.instructor} ({subject.schedule})
                    {/* Buttons for edit and delete (optional) */}
                    </li>
                ))}
                </ul>
            )}
        </div>
    )
}

export default AddSubject