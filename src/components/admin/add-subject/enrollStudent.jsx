import { db } from '../../../firebase/firebase';
import { collection, onSnapshot, doc, deleteDoc, writeBatch, getDocs, query, where } from 'firebase/firestore';
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
        idNumber: row.idNumber.toString(),
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
  
      const existingStudentIds = classList.map(student => student.idNumber.toString());
      console.log('Existing Student IDs:', existingStudentIds);
  
      const batch = writeBatch(db);
      const usersRef = collection(db, 'Users');
  
      for (const student of students) {
        console.log(`Processing student with ID Number ${student.idNumber}`);
  
        if (existingStudentIds.includes(student.idNumber.toString())) {
          console.log(`Student with ID Number ${student.idNumber} is already in the class list.`);
          continue;
        }
  
        const q = query(usersRef, where('role', '==', 'student'), where('idNumber', '==', student.idNumber.toString()), where('section', '==', student.section));
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0]; // Assuming unique idNumber and section, so taking the first match
          const userId = userDoc.id;
          const userData = userDoc.data();
          
          console.log(`Found matching user: ${userId}, Data:`, userData);
  
          // Use userId as the document ID for the classList collection
          const classListRef = doc(db, 'Subjects', subjectId, 'classList', userId);
          batch.set(classListRef, {
            name: student.name,
            idNumber: student.idNumber.toString(),
            section: student.section,
            uid: userId,
            ref: doc(db, 'Users', userId)
          });
        } else {
          console.log(`No matching student found in Users collection for ID Number ${student.idNumber} and Section ${student.section}.`);
        }
      }
  
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
        <Header/>
      </header>

      <div className="cdspHeader">
        <img 
          src="/cdspLogo.png"
          alt="CDSP"
          width={54}
          height={54}
        />    
        <div className="cdspHeaderText">
          <h4>COLEGIO DE SAN PEDRO, INC</h4>
          <p>Phase 1A Pacita Complex I, San Pedro, Laguna</p>
          <p>Information Technology Education Department</p>
        </div>
      </div>

      <main>
        <section id='schoolSectionPage'>
          <div className='table-container'>
            <h2 className='no-print' style={{textAlign: "center"}}>Student Enrollment</h2>
            <h3 className='h3-to-p'>{subject.title} - {subject.section}</h3>
            <h3 className='h3-to-p'>Instructor: {subject.instructor.name}</h3>
            <table className='striped-table'>
              <thead>
                <tr>
                  <th>ID Number</th>
                  <th>Name</th>
                  <th>Section</th>
                  <th className='no-print'>Actions</th>  
                </tr> 
              </thead>
              <tbody>
                {classList.map(student => (
                  <tr key={student.id}>
                    <td>{student.idNumber}</td>
                    <td>{student.name}</td>
                    <td>{student.section}</td>
                    <td className='no-print'><button className='classListButton' onClick={() => handleRemoveFromClassList(student.id)}>REMOVE</button></td>
                  </tr>
                ))}  
              </tbody>  
            </table>
            <div className='enrollStudentOptions no-print'>
              <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
              <button className='classListButton' onClick={handleAddToClassList}>Add Students to Class List</button>
              <button className='classListButton' onClick={window.print}>Print Class List</button>  
            </div>                           
          </div>
                 
        </section>
      </main>
    </>
  );
};

export default EnrollStudent;
