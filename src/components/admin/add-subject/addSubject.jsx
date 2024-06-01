import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { db } from '../../../firebase/firebase';
import { doc, setDoc, updateDoc, getDocs, collection } from 'firebase/firestore';

Modal.setAppElement('#root');

const AddSubject = () => {
  const initialTimeState = {
    MONDAY: { startHour: '', startMin: '', endHour: '', endMin: '' },
    TUESDAY: { startHour: '', startMin: '', endHour: '', endMin: '' },
    WEDNESDAY: { startHour: '', startMin: '', endHour: '', endMin: '' },
    THURSDAY: { startHour: '', startMin: '', endHour: '', endMin: '' },
    FRIDAY: { startHour: '', startMin: '', endHour: '', endMin: '' },
    SATURDAY: { startHour: '', startMin: '', endHour: '', endMin: '' },
  };

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
  const [users, setUsers] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [timeInputs, setTimeInputs] = useState(initialTimeState);

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

  const handleTimeChange = (day, field, value) => {
    setTimeInputs((prevTimeInputs) => ({
      ...prevTimeInputs,
      [day]: {
        ...prevTimeInputs[day],
        [field]: value,
      },
    }));
  };

  const formatSchedule = () => {
    const days = [];
    const times = [];

    Object.keys(timeInputs).forEach((day) => {
      const { startHour, startMin, endHour, endMin } = timeInputs[day];
      if (startHour && startMin && endHour && endMin) {
        const dayAbbreviation = day.substring(0, 3).toUpperCase();
        days.push(dayAbbreviation);
        times.push(`${startHour.padStart(2, '0')}:${startMin.padStart(2, '0')}-${endHour.padStart(2, '0')}:${endMin.padStart(2, '0')}`);
      }
    });

    return {
      days: days.join(','),
      time: times.join(','),
    };
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
    setTimeInputs(initialTimeState);
    setIsEditMode(false);
  };

  //ADD SUBJECT TO COLLECTION
  const addSub = async (e) => {
    e.preventDefault();
    const formattedSchedule = formatSchedule();
    const instructorData = users.find(user => user.id === subject.instructor);
    try {
      await setDoc(doc(db, "Subjects", subject.title), {
        subjectCode: subject.subjectCode,
        instructor: {
          id: instructorData.id,
          ref: instructorData.ref,
          name: instructorData.name
        },
        Schedule: formattedSchedule,
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

  //UPDATE SUBJECT INFORMATION
  const updateSub = async (e) => {
    e.preventDefault();
    const formattedSchedule = formatSchedule();
    const instructorData = users.find(user => user.id === subject.instructor);
    try {
      await updateDoc(doc(db, "Subjects", subject.title), {
        subjectCode: subject.subjectCode,
        instructor: {
          id: instructorData.id,
          ref: instructorData.ref, // Add the reference here
          name: instructorData.name
        },
        Schedule: formattedSchedule,
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

  //TABLE BEHAVIOR WHEN CLICKED
  const handleRowClick = (sub) => {
    // Ensure Schedule is properly initialized
    const schedule = sub.Schedule || { days: '', time: '' };
    
    setSubject({
      ...sub,
      Schedule: schedule
    });
    setIsEditMode(true);
  
    const days = schedule.days ? schedule.days.split(',') : [];
    const times = schedule.time ? schedule.time.split(',') : [];
  
    const newTimeInputs = { ...initialTimeState };
  
    days.forEach((day, index) => {
      const [start, end] = times[index].split('-');
      const [startHour, startMin] = start.split(':');
      const [endHour, endMin] = end.split(':');
      const dayFull = Object.keys(newTimeInputs).find(d => d.substring(0, 3).toUpperCase() === day);
      if (dayFull) {
        newTimeInputs[dayFull] = { startHour, startMin, endHour, endMin };
      }
    });
  
    setTimeInputs(newTimeInputs);
    openModal();
  };
  
  //FETCH SUBJECTS FROM SUBJECTS COLLECTION
  const fetchSubjects = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Subjects"));
      const subjectsList = querySnapshot.docs.map(doc => doc.data());
      setSubjects(subjectsList);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  //FETCH INSTRUCTORS FROM USERS COLLECTION
  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Users"));
      const usersList = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ref: doc.ref,
            name: `${data.name.firstName} ${data.name.middleName ? data.name.middleName + ' ' : ''}${data.name.lastName}`,
            role: data.role  // assuming the role field exists in the user document
          };
        })
        .filter(user => user.role === 'instructor');
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchUsers();
  }, []);

  //CLIENT-SIDE SEARCH
  const filteredSubjects = subjects.filter(sub => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      (showArchived || !sub.archived) &&
      ((sub.title && sub.title.toLowerCase().includes(lowerCaseQuery)) ||
        (sub.instructor && sub.instructor.name.toLowerCase().includes(lowerCaseQuery)) ||
        (sub.subjectCode && sub.subjectCode.toLowerCase().includes(lowerCaseQuery)) ||
        (sub.section && sub.section.toLowerCase().includes(lowerCaseQuery)) ||
        (sub.Schedule && sub.Schedule.days && sub.Schedule.days.toLowerCase().includes(lowerCaseQuery)) ||
        (sub.Schedule && sub.Schedule.time && sub.Schedule.time.toLowerCase().includes(lowerCaseQuery)))
    );
  });

  //INPUT VALIDATION FOR SCHEDULE
  const isNumberKey = (evt) => {
    const charCode = evt.which ? evt.which : evt.keyCode;

    if (charCode === 8 || charCode === 46 || charCode === 9 ||
      (charCode >= 37 && charCode <= 40) || charCode === 27) {
      return;
    }

    if (charCode < 48 || charCode > 57) {
      evt.preventDefault();
      return;
    }

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
                <th>Instructor</th>
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
                    <td>{sub.instructor.name}</td>
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
              minWidth: '420px',
              width: '100%',
              overflowX: 'auto'
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
              Instructor:
              <select
                name="instructor"
                value={subject.instructor}
                onChange={handleChange}
              >
                <option value="">Select Instructor</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
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
                {Object.keys(timeInputs).map((day) => (
                  <tr key={day}>
                    <td>{day}</td>
                    <td>
                      <input
                        style={{ width: '60px' }}
                        type="number"
                        min="0"
                        max="23"
                        maxLength={2}
                        onKeyDown={isNumberKey}
                        value={timeInputs[day].startHour}
                        onChange={(e) => handleTimeChange(day, 'startHour', e.target.value)}
                      />:
                      <input
                        style={{ width: '60px' }}
                        type="number"
                        min="0"
                        max="59"
                        maxLength={2}
                        onKeyDown={isNumberKey}
                        value={timeInputs[day].startMin}
                        onChange={(e) => handleTimeChange(day, 'startMin', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        style={{ width: '60px' }}
                        type="number"
                        min="0"
                        max="23"
                        maxLength={2}
                        onKeyDown={isNumberKey}
                        value={timeInputs[day].endHour}
                        onChange={(e) => handleTimeChange(day, 'endHour', e.target.value)}
                      />:
                      <input
                        style={{ width: '60px' }}
                        type="number"
                        min="0"
                        max="59"
                        maxLength={2}
                        onKeyDown={isNumberKey}
                        value={timeInputs[day].endMin}
                        onChange={(e) => handleTimeChange(day, 'endMin', e.target.value)}
                      />
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

###OLD CODE FOR DELETING SUBJECTS(NOT USABLE ANYMORE)

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
*/