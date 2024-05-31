import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { db } from '../../../firebase/firebase';
import { doc, setDoc, updateDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';

Modal.setAppElement('#root');

const AddSubject = () => {
  const [subject, setSubject] = useState({
    Schedule: {
      days: '',
      time: '',
    },
    section: '',
    subjectCode: '',
    title: '',
    instructor: '',
    archived: false,
  });

  const [subjects, setSubjects] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("Schedule")) {
      const [schedule, key] = name.split(".");
      setSubject((prevSubject) => ({
        ...prevSubject,
        Schedule: {
          ...prevSubject.Schedule,
          [key]: value,
        },
      }));
    } else {
      setSubject((prevSubject) => ({
        ...prevSubject,
        [name]: name === "archived" ? value === "true" : value,
      }));
    }
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSubject({
      Schedule: {
        days: '',
        time: '',
      },
      section: '',
      subjectCode: '',
      title: '',
      instructor: '',
      archived: false,
    });
    setIsEditMode(false);
  };

  // ADD SUBJECT TO COLLECTION
  const addSub = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "Subjects", subject.title), {
        subjectCode: subject.subjectCode,
        instructor: subject.instructor,
        Schedule: subject.Schedule,
        section: subject.section,
        title: subject.title,
        archived: subject.archived
      });
      console.log("Subject added successfully!");
      closeModal();
      fetchSubjects();
    } catch (error) {
      alert("Error adding subject.");
      console.error(error);
    }
  };

  // UPDATE SUBJECT
  const updateSub = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "Subjects", subject.title), {
        subjectCode: subject.subjectCode,
        instructor: subject.instructor,
        Schedule: subject.Schedule,
        section: subject.section,
        title: subject.title,
        archived: subject.archived
      });
      console.log("Subject updated successfully!");
      closeModal();
      fetchSubjects();
    } catch (error) {
      alert("Error updating subject.");
      console.error(error);
    }
  };

  const handleRowClick = (sub) => {
    setSubject(sub);
    setIsEditMode(true);
    openModal();
  };

  // FETCH SUBJECTS FROM COLLECTION
  const fetchSubjects = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Subjects"));
      const subjectsList = querySnapshot.docs.map(doc => doc.data());
      setSubjects(subjectsList);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  //REALTIME UPDATE
  useEffect(() => {
    fetchSubjects();
  }, []);

  //CLIENT-SIDE FILTERING
  const filteredSubjects = subjects.filter(sub => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      (showArchived || !sub.archived) &&
      (sub.title.toLowerCase().includes(lowerCaseQuery) ||
        sub.instructor.toLowerCase().includes(lowerCaseQuery) ||
        sub.schedule.toLowerCase().includes(lowerCaseQuery))
    );
  });

  //INPUT VALIDATION FOR TIME
  const isNumberKey = (evt) => {
    const charCode = evt.which ? evt.which : evt.keyCode;
  
    // Allow backspace, delete, tab, arrows, and escape
    if (charCode === 8 || charCode === 46 || charCode === 9 ||
        (charCode >= 37 && charCode <= 40) || charCode === 27) {
      return;
    }
  
    // Allow only digits from 0 to 9
    if (charCode < 48 || charCode > 57) {
      evt.preventDefault();
      return;
    }
  
    // Check for input length (limit to 2 digits)
    const input = evt.target;
    if (input.value.length >= 2) {
      evt.preventDefault();
    }
  };

  return (
    <>
      <section id='schoolSectionPage'>
        <div style={{ overflowX: 'auto' }}>
          <h2>Subjects List</h2>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              margin: '0px 10px 10px 0px'
            }}
          />
          <label>
            <input
              type="checkbox"
              checked={showArchived}
              onChange={() => setShowArchived(!showArchived)}
              style={{ marginRight: '10px' }}
            />
            Show Archived
          </label>

          <table className='striped-table'>
            <thead>
              <tr>
                <th>Subject Code</th>
                <th>Title</th>
                <th>Section</th>
                <th>Days</th>
                <th>Time</th>
                <th>Archived</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map((sub, index) => {
                const schedule = sub.Schedule || { days: '', time: '' };
                return (
                  <tr key={index} onClick={() => handleRowClick(sub)}>
                    <td>{sub.subjectCode}</td>
                    <td>{sub.title}</td>
                    <td>{sub.section}</td> 
                    <td>{schedule.days}</td> 
                    <td>{schedule.time}</td>              
                    <td>{sub.archived ? "Yes" : "No"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button
            onClick={openModal}
            className="addSubButton"
            style={{ marginTop: '10px' }}
          >
            Add Subject
          </button>
        </div>

        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel={isEditMode ? "Edit Subject" : "Add Subject"}
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
              width: '100%',
            }
          }}
        >
          <form id='submitSub' onSubmit={isEditMode ? updateSub : addSub}>
            <label>
              <h2>{isEditMode ? "Edit Subject" : "Add Subject"}</h2>
            </label>
            <label className='addSubForm'>
              Title:
              <input
                type="text"
                name="title"
                value={subject.title}
                onChange={handleChange}
                disabled={isEditMode}
              />
            </label>
            <label className='addSubForm'>
              Subject Code:
              <input
                type="text"
                name="subjectCode"
                value={subject.subjectCode}
                onChange={handleChange}
              />
            </label>
            <label className='addSubForm'>
              Section:
              <input
                type="text"
                name="section"
                value={subject.section}
                onChange={handleChange}
              />
            </label>
            <label className='addSubForm'>
              Archived:
              <select
                name="archived"
                value={subject.archived}
                onChange={handleChange}
              >
                <option value={false}>No</option>
                <option value={true}>Yes</option>
              </select>
            </label>
            <table> 
                <thead>
                  <tr>
                    <th>DAY</th>
                    <th>START TIME</th>
                    <th>END TIME</th>
                  </tr>
                </thead>
                <tbody>
                  {[ 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY' ].map((day) => (
                    <tr key={day}>
                      <td>{day}</td>
                      <td>
                        <input style={{width: '60px'}} type="number" min="0" max="23" maxLength={2} onKeyDown={isNumberKey}/>:
                        <input style={{width: '60px'}} type="number" min="0" max="59" maxLength={2} onKeyDown={isNumberKey}/>
                      </td>
                      <td>
                        <input style={{width: '60px'}} type="number" min="0" max="23" maxLength={2} onKeyDown={isNumberKey}/>:
                        <input style={{width: '60px'}} type="number" min="0" max="59" maxLength={2} onKeyDown={isNumberKey}/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            <div id="subCrudDiv">
              <button
                type="submit"
                className="subCrudButton"
              >{isEditMode ? 'Update Subject' : 'Add Subject'}</button>
              <button
                type="button"
                onClick={closeModal}
                className="subCrudButton"
              >Cancel</button>
            </div>
          </form>
        </Modal>
      </section>
    </>
  );
};

export default AddSubject;








/*

Schedule: {
      days: '',
      time: '',
    },
    section: '',
    subjectCode: '',
    title: '',
    archived: false,


instructor: subject.instructor,
        schedule: subject.schedule,
        title: subject.title,
        archived: subject.archived
const [subject, setSubject] = useState({
    instructor: '',
    schedule: '',
    title: '',
    archived: false,
  });
<table className='striped-table'>
            <thead>
              <tr>
                <th>Subject Code</th>
                <th>Title</th>
                <th>Section</th>
                <th>Instructor</th>
                <th>Schedule</th>
                <th>Archived</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map((sub, index) => (
                <tr key={index} onClick={() => handleRowClick(sub)}>
                  <td>1</td>
                  <td>{sub.title}</td>
                  <td>a</td>
                  <td>{sub.instructor}</td>                  
                  <td>{sub.schedule}</td>
                  <td>{sub.archived ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebase';
import { doc, setDoc, updateDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';

const AddSubject = () => {
  const [subject, setSubject] = useState({
    instructor: '',
    schedule: '',
    title: '',
    archived: false,
  });

  const [subjects, setSubjects] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubject({ ...subject, [name]: name === "archived" ? value === "true" : value });
  };

  //ADD SUBJECT TO COLLECTION
  const addSub = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "Subjects", subject.title), {
        instructor: subject.instructor,
        schedule: subject.schedule,
        title: subject.title,
        archived: subject.archived
      });
      console.log("Subject added successfully!");
      setSubject({
        instructor: '',
        schedule: '',
        title: '',
        archived: false,
      });
      fetchSubjects();
    } catch (error) {
      alert("Error adding subject.");
      console.error(error);
    }
  };

  //UPDATE SUBJECT
  const updateSub = async (title, updatedData) => {
    try {
      await updateDoc(doc(db, "Subjects", title), updatedData);
      console.log("Subject updated successfully!");
      setSubject({
        instructor: '',
        schedule: '',
        title: '',
        archived: false,
      });
      fetchSubjects();
    } catch (error) {
      alert("Error updating subject.");
      console.error(error);
    }
  };

  const handleRowClick = (sub) => {
    setSubject(sub);
  };

  //FETCH SUBJECTS FROM COLLECTION
  const fetchSubjects = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Subjects"));
      const subjectsList = querySnapshot.docs.map(doc => doc.data());
      setSubjects(subjectsList);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  //CLIENT-SIDE FILTERING
  const filteredSubjects = subjects.filter(sub => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      (showArchived || !sub.archived) &&
      (sub.title.toLowerCase().includes(lowerCaseQuery) ||
        sub.instructor.toLowerCase().includes(lowerCaseQuery) ||
        sub.schedule.toLowerCase().includes(lowerCaseQuery))
    );
  });

  return (
    <>
      <section id='schoolSectionPage'>
        <div style={{overflowX: 'auto'}}>
          <h2>Subjects List</h2>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              margin: '0px 10px 10px 0px'
            }}
          />
          <label>
            <input
              type="checkbox"
              checked={showArchived}
              onChange={() => setShowArchived(!showArchived)}
              style={{marginRight:'10px'}}
            />
            Show Archived
          </label>
          
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Instructor</th>
                <th>Schedule</th>
                <th>Archived</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map((sub, index) => (
                <tr key={index} onClick={() => handleRowClick(sub)}>
                  <td>{sub.title}</td>
                  <td>{sub.instructor}</td>
                  <td>{sub.schedule}</td>
                  <td>{sub.archived ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form id='submitSub' onSubmit={addSub}>
          <label>
            <h2>Subject Information</h2>
          </label>
          <label className='addSubForm'>
            Title:
            <input
              type="text"
              name="title"
              value={subject.title}
              onChange={handleChange}
            />
          </label>
          <label className='addSubForm'>
            Instructor: (Temporary, will be changed immediately to a dropdown selection once mapagana yung database)
            <input
              type="text"
              name="instructor"
              value={subject.instructor}
              onChange={handleChange}
            />
          </label>
          <label className='addSubForm'>
            Schedule: (Placeholder only)
            <input
              type="text"
              name="schedule"
              value={subject.schedule}
              onChange={handleChange}
            />
          </label>
          <label className='addSubForm'>
            Archived:
            <select
              name="archived"
              value={subject.archived}
              onChange={handleChange}
            >
              <option value={false}>No</option>
              <option value={true}>Yes</option>
            </select>
          </label>
          <div id="subCrudDiv">
            <button
              type="submit"
              className="subCrudButton"
            >Add Subject</button>
            <button
              type="button"
              onClick={() => updateSub(subject.title, {
                instructor: subject.instructor,
                schedule: subject.schedule,
                title: subject.title,
                archived: subject.archived
              })}
              className="subCrudButton"
            >Update Subject</button>
          </div>
        </form>
      </section>
    </>
  );
};

export default AddSubject;


const deleteSub = async (title) => {
    try {
      await deleteDoc(doc(db, "Subjects", title));
      console.log("Subject deleted successfully!");
      fetchSubjects();
    } catch (error) {
      alert("Error deleting subject.");
      console.error(error);
    }
  };

<button
              type="button"
              onClick={() => deleteSub(subject.title)}
              className="subCrudButton"
            >Delete Subject</button>



    CODE FOR THE TABLE

    <html>
    <head>
        <title>Test Components</title>
        <style>
            input {
                width: 60px;
            }
            table, th, td {
              border: 1px solid black;
              border-collapse: collapse;
            }
            th {
              text-align: left;
            }
            </style>
    </head>
    <body>       
        <main>
            <p>Hello World</p>
               <table>
                <thead>
                    <th>DAY</th>
                    <th>START TIME</th>
                    <th>END TIME</th>
                </thead>
                <tbody>
                    <tr>
                        <td>MONDAY</td>
                        <td><input type="number"min="0" max="23" onkeypress="return isNumberKey(event)">:<input type="number"min="0" max="59" onkeypress="return isNumberKey(event)"></td>
                        <td><input type="number"min="0" max="23" onkeypress="return isNumberKey(event)">:<input type="number"min="0" max="59" onkeypress="return isNumberKey(event)"></td>
                    </tr>
                    <tr>
                        <td>TUESDAY</td>
                        <td><input type="number"min="0" max="23" onkeypress="return isNumberKey(event)">:<input type="number"min="0" max="59" onkeypress="return isNumberKey(event)"></td>
                        <td><input type="number"min="0" max="23" onkeypress="return isNumberKey(event)">:<input type="number"min="0" max="59" onkeypress="return isNumberKey(event)"></td>
                    </tr>
                    <tr>
                        <td>WEDNESDAY</td>
                        <td><input type="number"min="0" max="23" onkeypress="return isNumberKey(event)">:<input type="number"min="0" max="59" onkeypress="return isNumberKey(event)"></td>
                        <td><input type="number"min="0" max="23" onkeypress="return isNumberKey(event)">:<input type="number"min="0" max="59" onkeypress="return isNumberKey(event)"></td>
                    </tr>
                    <tr>
                        <td>THURSDAY</td>
                        <td><input type="number"min="0" max="23" onkeypress="return isNumberKey(event)">:<input type="number"min="0" max="59" onkeypress="return isNumberKey(event)"></td>
                        <td><input type="number"min="0" max="23" onkeypress="return isNumberKey(event)">:<input type="number"min="0" max="59" onkeypress="return isNumberKey(event)"></td>
                    </tr>
                    <tr>
                        <td>FRIDAY</td>
                        <td><input type="number"min="0" max="23" onkeypress="return isNumberKey(event)">:<input type="number"min="0" max="59" onkeypress="return isNumberKey(event)"></td>
                        <td><input type="number"min="0" max="23" onkeypress="return isNumberKey(event)">:<input type="number"min="0" max="59" onkeypress="return isNumberKey(event)"></td>
                    </tr>
                    <tr>
                        <td>SATURDAY</td>
                        <td><input type="number"min="0" max="23" onkeypress="return isNumberKey(event)">:<input type="number"min="0" max="59" onkeypress="return isNumberKey(event)"></td>
                        <td><input type="number"min="0" max="23" onkeypress="return isNumberKey(event)">:<input type="number"min="0" max="59" onkeypress="return isNumberKey(event)"></td>
                    </tr>
                                       
                </tbody>
               </table>
               <button>UPDATE SUBJECT</button>
        </main>
    </body>
    <script>
        function isNumberKey(evt){
            var charCode = (evt.which) ? evt.which : event.keyCode;
            return !(charCode > 31 && (charCode < 48 || charCode > 57));
        }
    </script>
</html>
*/