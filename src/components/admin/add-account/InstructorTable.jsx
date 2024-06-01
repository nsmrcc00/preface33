import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase/firebase'; // Import your Firestore instance

const InstructorsTable = ({ setSelectedAccount }) => {
    const [instructors, setInstructors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const instructorsCollection = collection(db, "Users");
        const q = query(instructorsCollection, where("role", "==", "instructor"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const instructorsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setInstructors(instructorsData);
            console.log("Updated Table");
        });

        // Clean up subscription on unmount
        return () => unsubscribe();
    }, []);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter instructors based on search term
    const filteredInstructors = instructors.filter((instructor) => {
        const fullName = `${instructor.name.firstName} ${instructor.name.middleName} ${instructor.name.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) ||
            instructor.idNumber && instructor.email.toLowerCase().includes(searchTerm.toLowerCase())|| 
            instructor.idNumber && instructor.idNumber.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div style={{overflowX: 'auto'}}>
          <h2>Accounts List</h2>
            <input
                type="text"
                placeholder="Search Instructors..."
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
                    </tr>
                </thead>
                <tbody>
                    {filteredInstructors.map((instructor) => (
                        <tr key={instructor.id} onClick={() => setSelectedAccount(instructor)}>
                            <td>{instructor.idNumber}</td>
                            <td>{instructor.email}</td>
                            <td>
                                {instructor.name.firstName} {instructor.name.middleName} {instructor.name.lastName}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default InstructorsTable;
