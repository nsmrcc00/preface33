import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebase';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'; 

const AddSubject = () => {
  const [subject, setSubject] = useState({
    instructor: '',
    schedule: '',
    title: ''
  });

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
    } catch (error) {
      console.error("Error adding subject:", error);
    }
  };

  const getSub = async (title) => {
    try {
      const docSnap = await getDoc(doc(db, "Subjects", title));
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Subject:", data);
      } else {
        console.log("No such subject!");
      }
    } catch (error) {
      console.error("Error getting subject:", error);
    }
  };

  const updateSub = async (title, updatedData) => {
    try {
      await updateDoc(doc(db, "Subjects", title), updatedData);
      console.log("Subject updated successfully!");
    } catch (error) {
      console.error("Error updating subject:", error);
    }
  };

  const deleteSub = async (title) => {
    try {
      await deleteDoc(doc(db, "Subjects", title));
      console.log("Subject deleted successfully!");
    } catch (error) {
      console.error("Error deleting subject:", error);
    }
  };

  return (
    <>    
      <form onSubmit={addSub}>
        <label>
          Instructor:
          <input
            type="text"
            name="instructor"
            value={subject.instructor}
            onChange={handleChange}
          />
        </label>
        <label>
          Schedule:
          <input
            type="text"
            name="schedule"
            value={subject.schedule}
            onChange={handleChange}
          />
        </label>
        <label>
          Title:
          <input
            type="text"
            name="title"
            value={subject.title}
            onChange={handleChange}
          />
        </label>
        <button type="submit">Add Subject</button>
      </form>

      <button onClick={() => getSub(subject.title)}>Get Subject</button>
      <button onClick={() => updateSub(subject.title, {
        instructor: subject.instructor,
        schedule: subject.schedule,
        title: subject.title
      })}>Update Subject</button>
      <button onClick={() => deleteSub(subject.title)}>Delete Subject</button>
    </>
  );
};

export default AddSubject;
