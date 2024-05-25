import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebase';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';

/*
<button
              type="button"
              onClick={() => deleteSub(subject.title)}
              className="subCrudButton"
            >Delete Subject</button>
*/
const AddSubject = () => {
  const [subject, setSubject] = useState({
    instructor: '',
    schedule: '',
    title: '',
    archived: false, // Initialize as a boolean
  });

  const [subjects, setSubjects] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubject({ ...subject, [name]: name === "archived" ? value === "true" : value }); // Handle select for archived
  };

  const addSub = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "Subjects", subject.title), {
        instructor: subject.instructor,
        schedule: subject.schedule,
        title: subject.title,
        archived: subject.archived // Include archived field
      });
      console.log("Subject added successfully!");
      setSubject({
        instructor: '',
        schedule: '',
        title: '',
        archived: false,
      });
      fetchSubjects(); // Refresh the table after adding a subject
    } catch (error) {
      alert("Error adding subject.");
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
        title: '',
        archived: false,
      });
      fetchSubjects(); // Refresh the table after updating a subject
    } catch (error) {
      alert("Error updating subject.");
      console.error(error);
    }
  };

  const deleteSub = async (title) => {
    try {
      await deleteDoc(doc(db, "Subjects", title));
      console.log("Subject deleted successfully!");
      fetchSubjects(); // Refresh the table after deleting a subject
    } catch (error) {
      alert("Error deleting subject.");
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
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  useEffect(() => {
    fetchSubjects(); // Fetch subjects when the component mounts
  }, []);

  return (
    <>
      <section id='schoolSectionPage'>
        <div>
          <h2>Subjects List</h2>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Instructor</th>
                <th>Schedule</th>
                <th>Archived</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub, index) => (
                <tr key={index} onClick={() => handleRowClick(sub)}>
                  <td>{sub.title}</td>
                  <td>{sub.instructor}</td>
                  <td>{sub.schedule}</td>
                  <td>{sub.archived ? "Yes" : "No"}</td> {/* Display Yes/No for boolean */}
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
            Instructor: (Temporary, will be changed immediately to a dropdown selection once mapagana yung database)
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
          <label className='addSubForm'>
            Archived:
            <select
              name="archived"
              value={subject.archived}
              onChange={handleChange}
            >
              <option value={false}>No</option>
              <option value={true}>Yes</option>
            </select>
          </label>
          <div id="subCrudDiv">
            <button
              type="submit"
              className="subCrudButton"
            >Add Subject</button>
            <button
              type="button"
              onClick={() => updateSub(subject.title, {
                instructor: subject.instructor,
                schedule: subject.schedule,
                title: subject.title,
                archived: subject.archived
              })}
              className="subCrudButton"
            >Update Subject</button>
            
          </div>
        </form>
      </section>
    </>
  );
};

export default AddSubject;
