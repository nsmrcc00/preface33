import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';

function InstructorsTable() {
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    const getInstructors = async () => {
      const instructorsCollection = collection(db, "Users");
      const q = query(instructorsCollection, where("role", "==", "instructor"));

      const querySnapshot = await getDocs(q);
      const instructorsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setInstructors(instructorsData);
    };

    getInstructors();
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Email</th>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        {instructors.map((instructor) => (
          <tr key={instructor.id}>
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
