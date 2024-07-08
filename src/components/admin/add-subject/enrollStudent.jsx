import { db } from '../../../firebase/firebase';
import { collection, onSnapshot, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import XLSX from 'xlsx';
import Header from '../../header/Header';

const EnrollStudent = () => {
  const [subject, setSubject] = useState({ 
    title: '', 
    section: '', 
    instructor: {
      name: ''
    }});
  const [classList, setClassList] = useState([]);
  const [students, setStudents] = useState([]);
  const { subjectId } = useParams();

  useEffect(() => {
    if (subjectId) {
      const unsubscribeSubject = fetchSubjectDetails(subjectId);
      const unsubscribeClassList = fetchClassList(subjectId);
  
      return () => {
        unsubscribeSubject();
        unsubscribeClassList();
      };
    }
  }, [subjectId]);

  const fetchSubjectDetails = (subjectId) => {
    const subjectRef = doc(db, 'Subjects', subjectId);
    const unsubscribe = onSnapshot(subjectRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setSubject({
          title: data.title || '',
          section: data.section || '',
          instructor: {
            name: data.instructor.name || ''
          }
        });
      }
    });  
    return unsubscribe;
  };
  
  const fetchClassList = (subjectId) => {
    const classListRef = collection(db, 'Subjects', subjectId, 'classList');
    const unsubscribe = onSnapshot(classListRef, (classListSnapshot) => {
      const classListData = classListSnapshot.docs.map(doc => ({
        id: doc.id,
        idNumber: doc.data().idNumber,
        name: doc.data().name,
        section: doc.data().section,
      }));
      setClassList(classListData);
    });

    return () => unsubscribe();
  };

  const handleRemoveFromClassList = async (documentId) => {
    const confirmed = window.confirm('Are you sure you want to remove this student from the class list?');
    if (confirmed) {
      try {
        await deleteDoc(doc(db, 'Subjects', subjectId, 'classList', documentId));
        alert('Student removed from class list');
      } catch (error) {
        console.error('Error removing student from class list: ', error);
        alert('Error removing student from class list');
      }
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      const parsedStudents = json.map((row) => ({
        idNumber: row.idNumber,
        name: row.name,
        section: row.section,
      }));

      console.log('Parsed Students:', parsedStudents);
      setStudents(parsedStudents);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleAddToClassList = async () => {
    if (subjectId) {
      console.log('Students:', students);
      console.log('Class List:', classList);

      const existingStudentIds = classList.map(student => student.idNumber);
      console.log('Existing Student IDs:', existingStudentIds);

      const studentsToAdd = students.filter(student => !existingStudentIds.includes(student.idNumber));
      console.log('Students to Add:', studentsToAdd);

      if (studentsToAdd.length === 0) {
        alert('Error! Student/s already added to the class list');
        return;
      }

      const batch = writeBatch(db);

      studentsToAdd.forEach(student => {
        console.log('Adding student:', student);

        const classListRef = doc(collection(db, 'Subjects', subjectId, 'classList'));
        batch.set(classListRef, {
          name: student.name,
          idNumber: student.idNumber,
          section: student.section,
          uid: student.id, // If you have 'id' available for each student
          ref: doc(db, 'Users', student.id) // If you have 'id' available for each student
        });
      });

      try {
        await batch.commit();
        alert('Students successfully added to class list');
      } catch (error) {
        console.error('Error adding students to class list: ', error);
        alert('Error adding students to class list');
      }
    }
  };

  return (
    <>
      <header>
        <Header />
      </header>
      <main>
        <section>
          <div className='table-container'>
            <h1>Student Enrollment</h1>
            <h2>{subject.title} - {subject.section} - {subject.instructor.name}</h2>
            <table className='striped-table'>
              <thead>
                <tr>
                  <th>ID Number</th>
                  <th>Name</th>
                  <th>Section</th>
                  <th>Actions</th>  
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
          </div>          
          <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
          <button onClick={handleAddToClassList}>Add Students to Class List</button>
        </section>
      </main>
    </>
  );
};

export default EnrollStudent;
