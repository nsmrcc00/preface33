import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase/firebase'; // Import your Firestore instance

function InstructorsTable({ setSelectedInstructor }) {
    const [instructors, setInstructors] = useState([]);
  
    useEffect(() => {
      const instructorsCollection = collection(db, "Users");
      const q = query(instructorsCollection, where("role", "==", "instructor"));
  
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const instructorsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInstructors(instructorsData);
      });
  
      // Clean up subscription on unmount
      return () => unsubscribe();
    }, []);
  
    return (
      <table >
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {instructors.map((instructor) => (
            <tr key={instructor.id} onClick={() => setSelectedInstructor(instructor)}>
              <td>{instructor.email}</td>
              <td>
                {instructor.name.firstName} {instructor.name.middleName} {instructor.name.lastName}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

export default InstructorsTable;
