import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebase';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, getDocs, collection } from 'firebase/firestore'; 

const AddSubject = () => {
  const [subject, setSubject] = useState({
    instructor: '',
    schedule: '',
    title: ''
  });

  const [subjects, setSubjects] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubject({ ...subject, [name]: value });
  };

  const addSub = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "Subjects", subject.title), {
        instructor: subject.instructor,
        schedule: subject.schedule,
        title: subject.title
      }); 
      console.log("Subject added successfully!");
      setSubject({
        instructor: '',
        schedule: '',
        title: ''
      });
      fetchSubjects(); // Refresh the table after adding a subject
    } catch (error) {
      alert("Error adding subject.")
      console.error(error);
    }
  };

  const updateSub = async (title, updatedData) => {
    try {
      await updateDoc(doc(db, "Subjects", title), updatedData);
      console.log("Subject updated successfully!");
      setSubject({
        instructor: '',
        schedule: '',
        title: ''
      });
      fetchSubjects(); // Refresh the table after adding a subject
    } catch (error) {
      alert("Error updating subject.")
      console.error(error);
    }
  };

  const deleteSub = async (title) => {
    try {
      await deleteDoc(doc(db, "Subjects", title));
      console.log("Subject deleted successfully!");
      setSubject({
        instructor: '',
        schedule: '',
        title: '',
      });
      fetchSubjects(); // Refresh the table after adding a subject
    } catch (error) {
      alert("Error deleting subject.")
      console.error(error);
    }
    
  };

  const handleRowClick = (sub) => {
    setSubject(sub);
  };

  const fetchSubjects = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Subjects"));
      const subjectsList = querySnapshot.docs.map(doc => doc.data());
      setSubjects(subjectsList);
      console.log
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  useEffect(() => {
    fetchSubjects(); // Fetch subjects when the component mounts
  }, []);

  return (
    <>  
      <main>
        <section id='schoolSectionPage'>

        <div>
            <h2>Subjects List</h2>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Instructor</th>
                  <th>Schedule</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub, index) => (
                  <tr key={index} onClick={() => handleRowClick(sub)}>
                    <td>{sub.title}</td>
                    <td>{sub.instructor}</td>
                    <td>{sub.schedule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div> 

          <form id='submitSub' onSubmit={addSub}>

            <label className='addSubForm'>
              Title:
              <input
                type="text"
                name="title"
                value={subject.title}
                onChange={handleChange}
              />
            </label>
            <label className='addSubForm'>
              Instructor:
              <input
                type="text"
                name="instructor"
                value={subject.instructor}
                onChange={handleChange}
              />
            </label>
            <label className='addSubForm'>
              Schedule:
              <input
                type="text"
                name="schedule"
                value={subject.schedule}
                onChange={handleChange}
              />
            </label>
            <div id="subCrudDiv">            
              <button 
                type="submit" 
                className="subCrudButton"
              >Add Subject</button>

              <button 
                onClick={() => updateSub(subject.title, 
                {
                  instructor: subject.instructor,
                  schedule: subject.schedule,
                  title: subject.title
                })}
                className="subCrudButton"
              >Update Subject</button>
              <button 
                onClick={() => deleteSub(subject.title)}
                className="subCrudButton"
              >Delete Subject</button>
            </div>             
          </form>
          


          
        </section>
      </main>
    </>
  );
};

export default AddSubject;
