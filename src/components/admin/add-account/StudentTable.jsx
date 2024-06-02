import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase/firebase'; // Import your Firestore instance

const StudentTable = ({ setSelectedAccount }) => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const studentsCollection = collection(db, "Users");
        const q = query(studentsCollection, where("role", "==", "student"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const studentsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setStudents(studentsData);
            console.log("Updated Table");
        });

        // Clean up subscription on unmount
        return () => unsubscribe();
    }, []);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter students based on search term
    const filteredStudents = students.filter((student) => {
        const fullName = `${student.name.firstName} ${student.name.middleName} ${student.name.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) ||
               student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase())|| 
               student.idNumber && student.idNumber.toLowerCase().includes(searchTerm.toLowerCase())||
               student.section && student.section.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div style={{overflowX: 'auto'}}>
          <h2>Accounts List</h2>
            <input
                type="text"
                placeholder="Search Students..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={{
                  margin: '0px 0px 10px'
                }}
            />
            <table className='striped-table'>
                <thead>
                    <tr>
                        <th>ID Number</th>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Section</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredStudents.map((student) => (
                        <tr key={student.id} onClick={() => setSelectedAccount(student)}>
                            <td>{student.idNumber}</td>
                            <td>{student.email}</td>
                            <td>
                                {student.name.firstName} {student.name.middleName} {student.name.lastName}
                            </td>
                            <td>{student.section}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default StudentTable;
