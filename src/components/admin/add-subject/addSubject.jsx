import { useState, useEffect } from "react";
import Modal from "react-modal";
import { db } from "../../../firebase/firebase";
import {
  doc,
  addDoc,
  updateDoc,
  getDocs,
  collection,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import XLSX from 'xlsx';

Modal.setAppElement("#root");

const initialTimeState = {
  MONDAY: { startHour: "", startMin: "", endHour: "", endMin: "" },
  TUESDAY: { startHour: "", startMin: "", endHour: "", endMin: "" },
  WEDNESDAY: { startHour: "", startMin: "", endHour: "", endMin: "" },
  THURSDAY: { startHour: "", startMin: "", endHour: "", endMin: "" },
  FRIDAY: { startHour: "", startMin: "", endHour: "", endMin: "" },
  SATURDAY: { startHour: "", startMin: "", endHour: "", endMin: "" },
};

const initialSubjectState = {
  Schedule: { days: "", time: "" },
  section: "",
  subjectCode: "",
  title: "",
  instructor: "",
  year: "",
  term: "",
  archived: false,
};

const yearOptions = [
  { value: "", label: "Select Year" },
  { value: "First Year", label: "First Year" },
  { value: "Second Year", label: "Second Year" },
  { value: "Third Year", label: "Third Year" },
  { value: "Fourth Year", label: "Fourth Year" },
];

const AddSubject = () => {
  const [subject, setSubject] = useState(initialSubjectState);
  const [subjects, setSubjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [sections, setSections] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [timeInputs, setTimeInputs] = useState(initialTimeState);
  const [filterYear, setFilterYear] = useState("");
  const [filterTerm, setFilterTerm] = useState("");
  const [previousInstructor, setPreviousInstructor] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("Schedule")) {
      const [, key] = name.split(".");
      setSubject((prev) => ({
        ...prev,
        Schedule: { ...prev.Schedule, [key]: value },
      }));
    } else {
      setSubject((prev) => ({
        ...prev,
        [name]: name === "archived" ? value === "true" : value,
      }));
    }
  };

  const handleTimeChange = (day, field, value) => {
    setTimeInputs((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const formatSchedule = () => {
    const days = [];
    const times = [];

    Object.keys(timeInputs).forEach((day) => {
      const { startHour, startMin, endHour, endMin } = timeInputs[day];
      if (startHour && startMin && endHour && endMin) {
        days.push(day.substring(0, 3).toUpperCase());
        times.push(
          `${startHour.padStart(2, "0")}:${startMin.padStart(2, "0")}-${endHour.padStart(2, "0")}:${endMin.padStart(2, "0")}`
        );
      }
    });

    return { days: days.join(","), time: times.join(",") };
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSubject(initialSubjectState);
    setTimeInputs(initialTimeState);
    setIsEditMode(false);
  };

  const validateFields = (data) => {
    const validData = {};
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) validData[key] = data[key];
    });
    return validData;
  };

  const addOrUpdateInstructorSubcollection = async (instructorId, subjectData) => {
    try {
      const instructorRef = doc(db, "Users", instructorId);
      const subjectsHandledRef = collection(instructorRef, "subjectsHandled");
      const querySnapshot = await getDocs(subjectsHandledRef);
      let subjectHandledDoc = null;

      querySnapshot.forEach((doc) => {
        if (doc.id === subjectData.id) subjectHandledDoc = doc;
      });

      const validatedSubjectData = validateFields({
        title: subjectData.title,
        ref: subjectData.ref,
        archived: subjectData.archived,
        year: subjectData.year,
        term: subjectData.term,
        instructorEmail: subjectData.instructor.email,
      });

      if (subjectHandledDoc) {
        await updateDoc(subjectHandledDoc.ref, {
          ...validatedSubjectData,
          subjectCode: subjectData.subjectCode,
          Schedule: subjectData.Schedule,
          section: subjectData.section,
        });
      } else {
        const subjectHandledDocRef = doc(subjectsHandledRef, subjectData.id);
        await setDoc(subjectHandledDocRef, {
          ...validatedSubjectData,
          subjectCode: subjectData.subjectCode,
          Schedule: subjectData.Schedule,
          section: subjectData.section,
        });
      }
    } catch (error) {
      console.error("Error in addOrUpdateInstructorSubcollection:", error);
    }
  };

  const prepareSubjectData = (instructorData, formattedSchedule, ref) => ({
    subjectCode: subject.subjectCode,       
    title: subject.title,
    section: subject.section,
    Schedule: formattedSchedule,
    instructor: {
      id: instructorData.id,
      ref: instructorData.ref,
      name: instructorData.name,
      email: instructorData.email,
    },
    year: subject.year,
    term: subject.term,
    archived: subject.archived,
    ref,
  });

  const addSub = async (e) => {
    e.preventDefault();
    const formattedSchedule = formatSchedule();
    const instructorData = users.find((user) => user.id === subject.instructor);
    const newSubject = prepareSubjectData(instructorData, formattedSchedule, null);

    try {
      const newSubjectRef = await addDoc(collection(db, "Subjects"), newSubject);
      newSubject.ref = newSubjectRef;
      newSubject.id = newSubjectRef.id;
      await addOrUpdateInstructorSubcollection(instructorData.id, newSubject);

      const updatedSubjects = [...subjects, { ...newSubject, id: newSubject.id }];
      setSubjects(updatedSubjects);
      setCachedSubjects(updatedSubjects);

      closeModal();
    } catch (error) {
      alert("Error adding subject.");
      console.error(error);
    }
  };

  const removeSubjectFromInstructor = async (instructorId, subjectId) => {
    try {
      const instructorRef = doc(db, "Users", instructorId);
      const subjectsHandledRef = collection(instructorRef, "subjectsHandled");
      await deleteDoc(doc(subjectsHandledRef, subjectId));
    } catch (error) {
      console.error("Error removing subject from instructor:", error);
    }
  };

  const updateSub = async (e) => {
    e.preventDefault();
    const formattedSchedule = formatSchedule();
    const instructorData = users.find((user) => user.id === subject.instructor);
    const updatedSubject = prepareSubjectData(
      instructorData,
      formattedSchedule,
      doc(db, "Subjects", subject.id)
    );
    updatedSubject.id = subject.id;

    try {
      const validatedSubject = validateFields(updatedSubject);
      await updateDoc(updatedSubject.ref, validatedSubject);

      if (previousInstructor && previousInstructor !== instructorData.id) {
        await removeSubjectFromInstructor(previousInstructor, updatedSubject.id);
      }

      await addOrUpdateInstructorSubcollection(instructorData.id, validatedSubject);

      const updatedSubjects = subjects.map((sub) =>
        sub.id === updatedSubject.id ? updatedSubject : sub
      );
      setSubjects(updatedSubjects);
      setCachedSubjects(updatedSubjects);

      closeModal();
    } catch (error) {
      alert("Error updating subject.");
      console.error(error);
    }
  };

  const handleRowClick = (sub) => {
    setSubject({ ...sub, Schedule: sub.Schedule || { days: "", time: "" }, id: sub.id });
    setIsEditMode(true);
    setPreviousInstructor(sub.instructor.id);

    const days = sub.Schedule.days ? sub.Schedule.days.split(",") : [];
    const times = sub.Schedule.time ? sub.Schedule.time.split(",") : [];

    const newTimeInputs = { ...initialTimeState };

    days.forEach((day, index) => {
      const [start, end] = times[index].split("-");
      const [startHour, startMin] = start.split(":");
      const [endHour, endMin] = end.split(":");
      const dayFull = Object.keys(newTimeInputs).find(
        (d) => d.substring(0, 3).toUpperCase() === day
      );
      if (dayFull) {
        newTimeInputs[dayFull] = { startHour, startMin, endHour, endMin };
      }
    });

    setTimeInputs(newTimeInputs);
    setModalIsOpen(true);
  };

  const [cachedSubjects, setCachedSubjects] = useState([]);
  const [cachedUsers, setCachedUsers] = useState([]);
  const [cachedSections, setCachedSections] = useState([]);

  const fetchSubjects = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Subjects"));
      const subjectsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSubjects(subjectsList);
      setCachedSubjects(subjectsList);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchUsers = async () => {
    if (cachedUsers.length > 0) {
      setUsers(cachedUsers);
    } else {
      try {
        const querySnapshot = await getDocs(collection(db, "Users"));
        const usersList = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ref: doc.ref,
              name: `${data.name.firstName} ${data.name.middleName ? data.name.middleName + " " : ""}${data.name.lastName}`,
              role: data.role,
              email: data.email,
            };
          })
          .filter((user) => user.role === "instructor");
        setUsers(usersList);
        setCachedUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
  };

  const fetchSections = async () => {
    if (cachedSections.length > 0) {
      setSections(cachedSections);
    } else {
      try {
        const querySnapshot = await getDocs(collection(db, "Sections"));
        const sectionsList = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          ref: doc.ref,
        }));
        setSections(sectionsList);
        setCachedSections(sectionsList);
      } catch (error) {
        console.error("Error fetching sections:", error);
      }
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchUsers();
    fetchSections();
  }, []);

  const filteredSubjects = subjects.filter((sub) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      (showArchived || !sub.archived) &&
      (filterYear === "" || sub.year === filterYear) &&
      (filterTerm === "" || sub.term === filterTerm) &&
      (sub?.title.toLowerCase().includes(lowerCaseQuery) ||
        sub?.instructor?.name.toLowerCase().includes(lowerCaseQuery) ||
        sub?.subjectCode.toLowerCase().includes(lowerCaseQuery) ||
        sub?.section.toLowerCase().includes(lowerCaseQuery) ||
        sub?.Schedule?.days.toLowerCase().includes(lowerCaseQuery) ||
        sub?.Schedule?.time.toLowerCase().includes(lowerCaseQuery))
    );
  });

  const isNumberKey = (evt) => {
    const charCode = evt.which ? evt.which : evt.keyCode;
    if ([8, 46, 9, 27].includes(charCode) || (charCode >= 37 && charCode <= 40)) return;
    if (charCode < 48 || charCode > 57 || evt.target.value.length >= 2) evt.preventDefault();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
  
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);
  
        let addedCount = 0;
        let skippedCount = 0;
  
        for (const row of parsedData) {
          // Check if subject already exists
          const existingSubject = subjects.find(sub => 
            sub.subjectCode === row.subjectCode &&
            sub.title === row.title &&
            sub.section === row.section
          );
  
          if (existingSubject) {
            console.log(`Skipping duplicate subject: ${row.subjectCode} - ${row.title} (Section: ${row.section})`);
            skippedCount++;
            continue;
          }
  
          let instructorData = users.find(user => 
            `${user.name}`.toLowerCase() === row.instructor.toLowerCase()
          );
  
          if (!instructorData) {
            instructorData = {
              id: "default_instructor_id",
              ref: doc(db, "Users", "default_instructor_id"),
              name: "Default Instructor",
              email: "default@example.com"
            };
          }
  
          const newSubject = {
            subjectCode: row.subjectCode,
            title: row.title,
            instructor: {
              id: instructorData.id,
              ref: instructorData.ref,
              name: instructorData.name,
              email: instructorData.email,
            },
            year: row.year,
            term: row.term,
            Schedule: {
              days: row.days,
              time: row.time
            },
            section: row.section,
            archived: row.archived.toLowerCase() === "yes",
          };
  
          // Add new subject to the Subjects collection
          const newSubjectRef = await addDoc(collection(db, "Subjects"), newSubject);
          const subjectWithId = { ...newSubject, id: newSubjectRef.id, ref: newSubjectRef };
  
          // Add the subject to the instructor's subjectsHandled subcollection
          await addOrUpdateInstructorSubcollection(instructorData.id, subjectWithId);
  
          // Update local state
          setSubjects(prevSubjects => [...prevSubjects, subjectWithId]);
          addedCount++;
        }
  
        alert(`Successfully added ${addedCount} new subjects. Skipped ${skippedCount} duplicate subjects.`);
      } catch (error) {
        console.error("Error processing file:", error);
        alert("There was an error processing the file. Please check the file format and try again.");
      }
    };
  
    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <section id="schoolSectionPage">
        <div className="table-container">
          <h2>Subjects List</h2>
          <div className="filter-sub">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-sub-style"
            />

            <select
              id="filterYear"
              className="filter-sub-style"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              {yearOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <select
              id="filterSem"
              className="filter-sub-style"
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
            >
              <option value="">Filter Term</option>
              <option value="First Semester">First Semester</option>
              <option value="Second Semester">Second Semester</option>
            </select>

            <label className="filter-sub-style">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={() => setShowArchived(!showArchived)}
                style={{ marginRight: "10px" }}
              />
              Show Archived
            </label>
          </div>

          <table className="striped-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Title</th>
                <th>Section</th>
                <th>Days</th>
                <th>Time</th>
                <th>Instructor</th>
                <th>Year</th>
                <th>Term</th>
                <th>Archived</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map((sub, index) => {
                const schedule = sub.Schedule || { days: "", time: "" };
                return (
                  <tr key={index} onClick={() => handleRowClick(sub)}>
                    <td>{sub.subjectCode}</td>
                    <td>{sub.title}</td>
                    <td>{sub.section}</td>
                    <td>{schedule.days}</td>
                    <td>{schedule.time}</td>
                    <td>{sub.instructor.name}</td>
                    <td>{sub.year}</td>
                    <td>{sub.term}</td>
                    <td>{sub.archived ? "Yes" : "No"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button
            onClick={openModal}
            className="addSubButton"
            style={{ marginTop: "10px" }}
          >
            Add Subject
          </button>
          <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
        </div>

        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel={isEditMode ? "Edit Subject" : "Add Subject"}
          style={{
            content: {
              top: "50%",
              left: "50%",
              right: "auto",
              bottom: "auto",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
              padding: "1.5rem",
              borderRadius: "1rem",
              width: "max(50%, 400px)",
              overflowX: "auto",
              maxHeight: "90vh",
            },
          }}
        >
          <form id="submitSub" onSubmit={isEditMode ? updateSub : addSub}>
            <h2 className="SubjectModal">{isEditMode ? "Edit Subject" : "Add Subject"}</h2>
              <div className="submitSubContent">
              <div className="subject-fields">
                <label className="addSubForm">
                  Title:
                  <input
                    type="text"
                    name="title"
                    value={subject.title}
                    onChange={handleChange}
                  />
                </label>
                <label className="addSubForm">
                  Course Code:
                  <input
                    type="text"
                    name="subjectCode"
                    value={subject.subjectCode}
                    onChange={handleChange}
                  />
                </label>
                <label className="addSubForm">
                  Section:
                  <select
                    name="section"
                    value={subject.section}
                    onChange={handleChange}
                  >
                    <option value="">Select Section</option>
                    {sections.map((section, index) => (
                      <option key={index} value={`${section.sectionName}`}>
                        {`${section.sectionName}`}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="addSubForm">
                  Instructor:
                  <select
                    name="instructor"
                    value={subject.instructor}
                    onChange={handleChange}
                  >
                    <option value="">Select Instructor</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="addSubForm">
                  Year:
                  <select name="year" value={subject.year} onChange={handleChange}>
                    {yearOptions.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="addSubForm">
                  Term:
                  <select name="term" value={subject.term} onChange={handleChange}>
                    <option value="">Select Term</option>
                    <option value="First Semester">First Semester</option>
                    <option value="Second Semester">Second Semester</option>
                  </select>
                </label>

                <label className="addSubForm">
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
              </div>

              <div className="subject-fields">
                <label>Schedule:</label>
                <table className="schedule-table">
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
                            style={{ width: "60px" }}
                            type="number"
                            min="0"
                            max="23"
                            maxLength={2}
                            onKeyDown={isNumberKey}
                            value={timeInputs[day].startHour}
                            onChange={(e) =>
                              handleTimeChange(day, "startHour", e.target.value)
                            }
                          />
                          :
                          <input
                            style={{ width: "60px" }}
                            type="number"
                            min="0"
                            max="59"
                            maxLength={2}
                            onKeyDown={isNumberKey}
                            value={timeInputs[day].startMin}
                            onChange={(e) =>
                              handleTimeChange(day, "startMin", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            style={{ width: "60px" }}
                            type="number"
                            min="0"
                            max="23"
                            maxLength={2}
                            onKeyDown={isNumberKey}
                            value={timeInputs[day].endHour}
                            onChange={(e) =>
                              handleTimeChange(day, "endHour", e.target.value)
                            }
                          />
                          :
                          <input
                            style={{ width: "60px" }}
                            type="number"
                            min="0"
                            max="59"
                            maxLength={2}
                            onKeyDown={isNumberKey}
                            value={timeInputs[day].endMin}
                            onChange={(e) =>
                              handleTimeChange(day, "endMin", e.target.value)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>              
              </div>  

              <div id="subCrudDiv">
                <button type="submit" className="subCrudButton">
                  {isEditMode ? "Update Subject" : "Add Subject"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="subCrudButton"
                >
                  Cancel
                </button>
              </div>           
            </div>
          </form>
        </Modal>
      </section>
    </>
  );
};

export default AddSubject;