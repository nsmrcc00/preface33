import { useEffect, useState } from 'react';
import { db } from '../../../firebase/firebase';
import { collection, query, where, getDocs, doc, writeBatch, deleteDoc } from 'firebase/firestore';
import Modal from 'react-modal';
import useSortableData from '../../table-sort/TableSort';

Modal.setAppElement('#root');

const AddToClassList = () => {
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [classList, setClassList] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      const q = query(collection(db, 'Subjects'), where('archived', '==', false));
      const querySnapshot = await getDocs(q);
      const subjectsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        subjectCode: doc.data().subjectCode,
        title: doc.data().title,
        instructorName: doc.data().instructor.name,
        section: doc.data().section
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
        section: doc.data().section,
        checked: false // Add a checked property to each student object
      }));
      setStudents(studentsList);
    };

    fetchSubjects();
    fetchStudents();
  }, []);

  const fetchClassList = async (subjectId) => {
    const classListRef = collection(db, 'Subjects', subjectId, 'classList');
    const classListSnapshot = await getDocs(classListRef);
    const classListData = classListSnapshot.docs.map(doc => ({
      id: doc.id,
      idNumber: doc.data().idNumber,
      name: doc.data().name,
      section: doc.data().section,
    }));
    setClassList(classListData);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStudentSearchChange = (event) => {
    setStudentSearchTerm(event.target.value);
  };

  const toggleSelectAll = () => {
    setSelectAllChecked(!selectAllChecked);
    setStudents(students.map(student => ({
      ...student,
      checked: !selectAllChecked
    })));
  };

  const toggleIndividualCheckbox = (id) => {
    setStudents(students.map(student => ({
      ...student,
      checked: student.id === id ? !student.checked : student.checked
    })));
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

  const openModal = async (subject) => {
    setSelectedSubject(subject);
    setModalIsOpen(true);
    await fetchClassList(subject.id);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedSubject(null);
    setClassList([]);
  };

  const getClassNamesFor = (name, sortConfig) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  const handleAddToClassList = async () => {
    if (selectedSubject) {
      const selectedStudents = students.filter(student => student.checked);
      const batch = writeBatch(db);

      selectedStudents.forEach(student => {
        const classListRef = doc(collection(db, 'Subjects', selectedSubject.id, 'classList'));
        batch.set(classListRef, {
          name: `${student.name.firstName} ${student.name.middleName} ${student.name.lastName}`,
          idNumber: student.idNumber,
          section: student.section,
          uid: student.id,
          ref: doc(db, 'Users', student.id)
        });
      });

      try {
        await batch.commit();
        await fetchClassList(selectedSubject.id); // Refresh the class list
        alert('Students successfully added to class list');
        // Clear the checkboxes
        setStudents(students.map(student => ({
          ...student,
          checked: false
        })));
        setSelectAllChecked(false);
      } catch (error) {
        console.error('Error adding students to class list: ', error);
        alert('Error adding students to class list');
      }

      closeModal();
    }
  };

  const handleRemoveFromClassList = async (documentId) => {
    try {
      await deleteDoc(doc(db, 'Subjects', selectedSubject.id, 'classList', documentId));
      await refreshClassList(selectedSubject.id); // Refresh the class list
      alert('Student removed from class list');
    } catch (error) {
      console.error('Error removing student from class list: ', error);
      alert('Error removing student from class list');
    }
  };

  const refreshClassList = async (subjectId) => {
    const classListRef = collection(db, 'Subjects', subjectId, 'classList');
    const classListSnapshot = await getDocs(classListRef);
    const classListData = classListSnapshot.docs.map(doc => ({
      id: doc.id,
      idNumber: doc.data().idNumber,
      name: doc.data().name,
      section: doc.data().section,
    }));
    setClassList(classListData);
  };
  

  return (
    <>
      <div className='table-container'>
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
              <th onClick={() => requestSortSubjects('section')} className={getClassNamesFor('section', sortConfigSubjects)}>Section</th>
            </tr>
          </thead>
          <tbody>
            {sortedSubjects.map(subject => (
              <tr key={subject.id} onClick={() => openModal(subject)}>
                <td>{subject.subjectCode}</td>
                <td>{subject.title}</td>
                <td>{subject.instructorName}</td>
                <td>{subject.section}</td>
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
            width: 'max(80%, 400px)',          
            overflowX: 'auto',
            overflowY: 'auto',            
          }
        }}
      >
        {selectedSubject && (
          <div>

            <div className='subjectInfo'>
              <h2 className='subjectInfoContent'>{selectedSubject.title}</h2>
              <p className='subjectInfoContent'><strong>Subject Code:</strong> {selectedSubject.subjectCode}</p>
              <p className='subjectInfoContent'><strong>Section:</strong> {selectedSubject.section}</p>
              <p className='subjectInfoContent'><strong>Instructor:</strong> {selectedSubject.instructorName}</p>
            </div>

            <label><strong>Class List</strong></label>
            <input
              type="text"
              placeholder="Search Class List..."
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
                {classList.map(student => (
                  <tr key={student.id}>
                    <td>{student.idNumber}</td>
                    <td>{student.name}</td>
                    <td>{student.section}</td>
                    <td><button className='classListButton' onClick={() => handleRemoveFromClassList(student.id)}>REMOVE</button></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <label><strong>Student List</strong></label>
            <input
              type="text"
              placeholder="Search Student List..."
              value={studentSearchTerm}
              onChange={handleStudentSearchChange}
              style={{
                margin: '10px 0px 10px 10px'
              }}
            />
            <table id='studentListTable' className='striped-table'>
              <thead>
                <tr>
                  <th><input type='checkbox' checked={selectAllChecked} onChange={toggleSelectAll} /></th>
                  <th onClick={() => requestSortStudents('idNumber')} className={getClassNamesFor('idNumber', sortConfigStudents)}>ID Number</th>
                  <th onClick={() => requestSortStudents('name.firstName')} className={getClassNamesFor('name.firstName', sortConfigStudents)}>Name</th>
                  <th onClick={() => requestSortStudents('section')} className={getClassNamesFor('section', sortConfigStudents)}>Section</th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map(student => (
                  <tr key={student.id}>
                    <td><input type='checkbox' checked={student.checked} onChange={() => toggleIndividualCheckbox(student.id)} /></td>
                    <td>{student.idNumber}</td>
                    <td>{student.name.firstName} {student.name.middleName} {student.name.lastName}</td>
                    <td>{student.section}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="studentListButton" onClick={handleAddToClassList}>Add to Class List</button>
            <button className="studentListButton" onClick={closeModal}>Close</button>
          </div>
        )}
      </Modal>
    </>
  );
}

export default AddToClassList;
