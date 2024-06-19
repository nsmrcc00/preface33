import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/firebase'; // Import your Firestore instance
import useSortableData from '../../table-sort/TableSort';

const StudentTable = ({ setSelectedAccount }) => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [sections, setSections] = useState([]);
    const [cachedSections, setCachedSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState('');

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

    // Handle status filter change
    const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
    };

    // Handle section filter change
    const handleSectionChange = (e) => {
        setSelectedSection(e.target.value);
    };

    // Filter students based on search term, selected status, and selected section
    const filteredStudents = students.filter((student) => {
        const fullName = `${student.name.firstName} ${student.name.middleName} ${student.name.lastName}`.toLowerCase();
        const matchesSearchTerm = fullName.includes(searchTerm.toLowerCase()) ||
            (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase())) || 
            (student.idNumber && student.idNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (student.section && student.section.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = selectedStatus ? student.status === selectedStatus : true;
        const matchesSection = selectedSection ? student.section === selectedSection : true;

        return matchesSearchTerm && matchesStatus && matchesSection;
    });

    const { items: sortedStudents, requestSort, sortConfig } = useSortableData(filteredStudents);

    const getClassNamesFor = (name) => {
        if (!sortConfig) {
            return;
        }
        return sortConfig.key === name ? sortConfig.direction : undefined;
    };

    const fetchSections = async () => {
        if (cachedSections.length > 0) {
            setSections(cachedSections);
        } else {
            try {
                const querySnapshot = await getDocs(collection(db, "Sections"));
                const sectionsList = querySnapshot.docs.map((doc) => ({
                    ...doc.data(),
                    ref: doc.ref, //may be unnecessary
                }));
                setSections(sectionsList);
                setCachedSections(sectionsList);
            } catch (error) {
                console.error("Error fetching sections:", error);
            }
        }
    };

    useEffect(() => {
        fetchSections();
    }, []);

    return (
        <div className='table-container'>
            <h2>Accounts List</h2>
            <div className="filter-sub">
                <input
                    type="text"
                    placeholder="Search Students..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="filter-sub-style"
                />
                <select 
                    id="filterSection"
                    className="filter-sub-style"
                    value={selectedSection}
                    onChange={handleSectionChange}
                >
                    <option value="">Filter Section</option>
                    {sections.map((section, index) => (
                        <option key={index} value={section.sectionName}>
                            {section.sectionName}
                        </option>
                    ))}
                </select>
                <select 
                    id="filterStatus"
                    className="filter-sub-style"
                    value={selectedStatus}
                    onChange={handleStatusChange}
                >
                    <option value="">Filter Status</option>
                    <option value="Enrolled">Enrolled</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>
            
            <table className='striped-table'>
                <thead>
                    <tr>
                        <th onClick={() => requestSort('idNumber')} className={getClassNamesFor('idNumber')}>ID Number</th>
                        <th onClick={() => requestSort('name.firstName')} className={getClassNamesFor('name.firstName')}>Name</th>
                        <th onClick={() => requestSort('email')} className={getClassNamesFor('email')}>Email</th>                        
                        <th onClick={() => requestSort('section')} className={getClassNamesFor('section')}>Section</th>
                        <th>Status</th>
                        {/*<th>MAC Address</th>*/}                        
                    </tr>
                </thead>
                <tbody>
                    {sortedStudents.map((student) => (
                        <tr key={student.id} onClick={() => setSelectedAccount(student)}>
                            <td>{student.idNumber}</td>                            
                            <td>
                                {student.name.firstName} {student.name.middleName} {student.name.lastName}
                            </td>                            
                            <td>{student.email}</td>
                            <td>{student.section}</td>
                            <td>{student.status}</td>
                            {/*<td>{student.macAddress}</td>*/}                            
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default StudentTable;
