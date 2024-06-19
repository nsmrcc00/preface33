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

Modal.setAppElement("#root");

const AddSubject = () => {
  const initialTimeState = {
    MONDAY: { startHour: "", startMin: "", endHour: "", endMin: "" },
    TUESDAY: { startHour: "", startMin: "", endHour: "", endMin: "" },
    WEDNESDAY: { startHour: "", startMin: "", endHour: "", endMin: "" },
    THURSDAY: { startHour: "", startMin: "", endHour: "", endMin: "" },
    FRIDAY: { startHour: "", startMin: "", endHour: "", endMin: "" },
    SATURDAY: { startHour: "", startMin: "", endHour: "", endMin: "" },
  };

  const [subject, setSubject] = useState({
    Schedule: {
      days: "",
      time: "",
    },
    section: "",
    subjectCode: "",
    title: "",
    instructor: "",
    year: "",
    term: "",
    archived: false,
  });

  const yearOptions = [
    { value: "", label: "Select Year" },
    { value: "First Year", label: "First Year" },
    { value: "Second Year", label: "Second Year" },
    { value: "Third Year", label: "Third Year" },
    { value: "Fourth Year", label: "Fourth Year" },
  ];

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
        times.push(
          `${startHour.padStart(2, "0")}:${startMin.padStart(
            2,
            "0"
          )}-${endHour.padStart(2, "0")}:${endMin.padStart(2, "0")}`
        );
      }
    });

    return {
      days: days.join(","),
      time: times.join(","),
    };
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSubject({
      Schedule: {
        days: "",
        time: "",
      },
      section: "",
      subjectCode: "",
      title: "",
      instructor: "",
      year: "",
      term: "",
      archived: false,
    });
    setTimeInputs(initialTimeState);
    setIsEditMode(false);
  };

  const validateFields = (data) => {
    const validData = {};
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) {
        validData[key] = data[key];
      }
    });
    return validData;
  };

  const addOrUpdateInstructorSubcollection = async (
    instructorId,
    subjectData
  ) => {
    try {
      const instructorRef = doc(db, "Users", instructorId);
      const subjectsHandledRef = collection(instructorRef, "subjectsHandled");
      const querySnapshot = await getDocs(subjectsHandledRef);
      let subjectHandledDoc = null;

      querySnapshot.forEach((doc) => {
        if (doc.id === subjectData.id) {
          subjectHandledDoc = doc;
        }
      });

      const validatedSubjectData = validateFields({
        title: subjectData.title,
        ref: subjectData.ref,
        archived: subjectData.archived,
        year: subjectData.year,
        term: subjectData.term,
      });

      if (subjectHandledDoc) {
        console.log(
          `Updating existing subjectHandled document with ID: ${subjectHandledDoc.id}`
        );
        await updateDoc(subjectHandledDoc.ref, {
          subjectCode: subjectData.subjectCode,
          title: subjectData.title,
          section: subjectData.section,
          ref: subjectData.ref,
          archived: subjectData.archived,
          year: subjectData.year,
          term: subjectData.term,
        });
      } else {
        console.log(
          `Adding new subjectHandled document with ID: ${subjectData.id}`
        );
        const subjectHandledDocRef = doc(subjectsHandledRef, subjectData.id);
        await setDoc(subjectHandledDocRef, {
          subjectCode: subjectData.subjectCode,
          title: subjectData.title,
          section: subjectData.section,
          ref: subjectData.ref,
          archived: subjectData.archived,
          year: subjectData.year,
          term: subjectData.term,
        });
      }
      console.log(
        "Instructor's subjectsHandled subcollection updated successfully!"
      );
    } catch (error) {
      console.error("Error in addOrUpdateInstructorSubcollection:", error);
    }
  };

  const prepareSubjectData = (instructorData, formattedSchedule, ref) => ({
    subjectCode: subject.subjectCode,
    instructor: {
      id: instructorData.id,
      ref: instructorData.ref,
      name: instructorData.name,
    },
    Schedule: formattedSchedule,
    section: subject.section,
    title: subject.title,
    year: subject.year,
    term: subject.term,
    archived: subject.archived,
    ref,
  });

  const addSub = async (e) => {
    e.preventDefault();
    const formattedSchedule = formatSchedule();
    const instructorData = users.find((user) => user.id === subject.instructor);
    const newSubject = prepareSubjectData(
      instructorData,
      formattedSchedule,
      null
    );

    try {
      const newSubjectRef = await addDoc(
        collection(db, "Subjects"),
        newSubject
      );
      newSubject.ref = newSubjectRef;
      newSubject.id = newSubjectRef.id;

      await addOrUpdateInstructorSubcollection(instructorData.id, newSubject);

      const updatedSubjects = [
        ...subjects,
        { ...newSubject, id: newSubject.id },
      ];
      setSubjects(updatedSubjects);
      setCachedSubjects(updatedSubjects);

      closeModal();
      console.log("Subject added successfully!");
    } catch (error) {
      alert("Error adding subject.");
      console.error(error);
    }
  };

  const removeSubjectFromInstructor = async (instructorId, subjectId) => {
    try {
      const instructorRef = doc(db, "Users", instructorId);
      const subjectsHandledRef = collection(instructorRef, "subjectsHandled");
      const subjectDocRef = doc(subjectsHandledRef, subjectId);
      await deleteDoc(subjectDocRef);
      console.log("Subject removed from previous instructor's subjectsHandled subcollection.");
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
      console.log("Subject updated successfully!");
    } catch (error) {
      alert("Error updating subject.");
      console.error(error);
    }
  };
  

  // Table behavior when clicked
  const handleRowClick = (sub) => {
    const schedule = sub.Schedule || { days: "", time: "" };
  
    setSubject({
      ...sub,
      Schedule: schedule,
      id: sub.id, // Ensure ID is set
    });
    setIsEditMode(true);
    
    setPreviousInstructor(sub.instructor.id); // Set previous instructor
  
    const days = schedule.days ? schedule.days.split(",") : [];
    const times = schedule.time ? schedule.time.split(",") : [];
  
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
    openModal();
  };
 
  // Cache data in local state
  const [cachedSubjects, setCachedSubjects] = useState([]);
  const [cachedUsers, setCachedUsers] = useState([]);
  const [cachedSections, setCachedSections] = useState([]);

  // Fetch subjects from "Subjects" collection
  const fetchSubjects = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Subjects"));
      const subjectsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSubjects(subjectsList);
      setCachedSubjects(subjectsList); // Update cached subjects
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  // Fetch instructors from "Users" collection
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
              name: `${data.name.firstName} ${
                data.name.middleName ? data.name.middleName + " " : ""
              }${data.name.lastName}`,
              role: data.role,
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

  // Fetch sections from "Sections" collection
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
    fetchSubjects();
    fetchUsers();
    fetchSections();
  }, []);

  // Client-side search
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

  // Input validation for schedule
  const isNumberKey = (evt) => {
    const charCode = evt.which ? evt.which : evt.keyCode;

    if (
      charCode === 8 ||
      charCode === 46 ||
      charCode === 9 ||
      (charCode >= 37 && charCode <= 40) ||
      charCode === 27
    ) {
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
              padding: "20px",
              borderRadius: "10px",
              width: "max(80%, 400px)",
              overflowX: "auto",
              maxHeight: "90vh",
            },
          }}
        >
          <form id="submitSub" onSubmit={isEditMode ? updateSub : addSub}>
            <h2>{isEditMode ? "Edit Subject" : "Add Subject"}</h2>
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
          </form>
        </Modal>
      </section>
    </>
  );
};

export default AddSubject;
