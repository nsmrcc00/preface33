import { useEffect, useState } from 'react';
import { db } from '../../../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Modal from 'react-modal';
import useSortableData from '../../table-sort/TableSort';

Modal.setAppElement('#root');

const AddToClassList = () => {
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      const q = query(collection(db, 'Subjects'), where('archived', '==', false));
      const querySnapshot = await getDocs(q);
      const subjectsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        subjectCode: doc.data().subjectCode,
        title: doc.data().title,
        instructorName: doc.data().instructor.name
      }));
      setSubjects(subjectsList);
    };

    const fetchStudents = async () => {
      const q = query(collection(db, 'Users'), where('role', '==', 'student'));
      const querySnapshot = await getDocs(q);
      const studentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        idNumber: doc.data().idNumber,
        name: doc.data().name,
        section: doc.data().section
      }));
      setStudents(studentsList);
    };

    fetchSubjects();
    fetchStudents();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStudentSearchChange = (event) => {
    setStudentSearchTerm(event.target.value);
  };

  const filteredSubjects = subjects.filter(subject =>
    (subject.subjectCode && subject.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (subject.title && subject.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (subject.instructorName && subject.instructorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredStudents = students.filter(student =>
    (student.idNumber && student.idNumber.toLowerCase().includes(studentSearchTerm.toLowerCase())) ||
    (student.name.firstName && student.name.firstName.toLowerCase().includes(studentSearchTerm.toLowerCase())) ||
    (student.name.middleName && student.name.middleName.toLowerCase().includes(studentSearchTerm.toLowerCase())) ||
    (student.name.lastName && student.name.lastName.toLowerCase().includes(studentSearchTerm.toLowerCase())) ||
    (student.section && student.section.toLowerCase().includes(studentSearchTerm.toLowerCase()))
  );

  const { items: sortedSubjects, requestSort: requestSortSubjects, sortConfig: sortConfigSubjects } = useSortableData(filteredSubjects);
  const { items: sortedStudents, requestSort: requestSortStudents, sortConfig: sortConfigStudents } = useSortableData(filteredStudents);

  const openModal = (subject) => {
    setSelectedSubject(subject);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedSubject(null);
  };

  const getClassNamesFor = (name, sortConfig) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  return (
    <>
      <div>
        <h2>Subjects</h2>
        <input
          type="text"
          placeholder="Search Subjects..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            margin: '0px 0px 10px'
          }}
        />
        <table className='striped-table'>
          <thead>
            <tr>
              <th onClick={() => requestSortSubjects('subjectCode')} className={getClassNamesFor('subjectCode', sortConfigSubjects)}>Subject Code</th>
              <th onClick={() => requestSortSubjects('title')} className={getClassNamesFor('title', sortConfigSubjects)}>Subject</th>
              <th onClick={() => requestSortSubjects('instructorName')} className={getClassNamesFor('instructorName', sortConfigSubjects)}>Instructor</th>
            </tr>
          </thead>
          <tbody>
            {sortedSubjects.map(subject => (
              <tr key={subject.id} onClick={() => openModal(subject)}>
                <td>{subject.subjectCode}</td>
                <td>{subject.title}</td>
                <td>{subject.instructorName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Subject Details"
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px',
            borderRadius: '10px',
            maxWidth: '80%',
            minWidth: '420px',
            width: '100%',
            overflowX: 'auto',
            overflowY: 'auto',
          }
        }}
      >
        {selectedSubject && (
          <div>
            <h2 style={{marginBottom: '10px'}}>{selectedSubject.title}</h2>
            <p><strong>Subject Code:</strong> {selectedSubject.subjectCode}</p>
            <p><strong>Instructor:</strong> {selectedSubject.instructorName}</p>
            {/* Add more subject details as needed */}
            <label><strong>Class List</strong></label>
            <input
              type="text"
              placeholder="Search Students..."
              style={{
                margin: '0px 0px 10px 10px'
              }}
            />  
            <table id='classListTable' className='striped-table'>
              <thead>
                <tr>
                  <th>ID Number</th>
                  <th>Name</th>
                  <th>Section</th>
                  <th>Options</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Placeholder</td>
                  <td>Placeholder</td>
                  <td>Placeholder</td>
                  <td>Placeholder</td>
                </tr>
              </tbody>
            </table>

            <label><strong>Student List</strong></label>
            <input
              type="text"
              placeholder="Search Students..."
              value={studentSearchTerm}
              onChange={handleStudentSearchChange}
              style={{
                margin: '10px 0px 10px 10px'
              }}
            />            
            <table id='studentListTable' className='striped-table'>
              <thead>
                <tr>
                  <th><input type='checkbox'/></th>
                  <th onClick={() => requestSortStudents('idNumber')} className={getClassNamesFor('idNumber', sortConfigStudents)}>ID Number</th>
                  <th onClick={() => requestSortStudents('name.firstName')} className={getClassNamesFor('name.firstName', sortConfigStudents)}>Name</th>
                  <th onClick={() => requestSortStudents('section')} className={getClassNamesFor('section', sortConfigStudents)}>Section</th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map(student => (
                  <tr key={student.id}>
                    <td><input type='checkbox'/></td>
                    <td>{student.idNumber}</td>
                    <td>{student.name.firstName} {student.name.middleName} {student.name.lastName}</td>
                    <td>{student.section}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={closeModal}>Close</button>
          </div>
        )}
      </Modal>
    </>
  );
}

export default AddToClassList;



