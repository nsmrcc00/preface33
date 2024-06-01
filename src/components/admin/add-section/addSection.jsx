import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebase';
import { doc, addDoc, updateDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';

const AddSection = () => {
  const [section, setSection] = useState({
    sectionName: '',
    yearLevel: '',
  });

  const [sections, setSections] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSection({ ...section, [name]: value });
  };

  // ADD SECTION TO COLLECTION
  const addSec = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "Sections"), {
        sectionName: section.sectionName,
        yearLevel: section.yearLevel,
      });
      console.log("Section added successfully!");
      setSection({
        sectionName: '',
        yearLevel: '',
      });
      fetchSections();
    } catch (error) {
      alert("Error adding section.");
      console.error(error);
    }
  };

  // UPDATE SECTION
  const updateSec = async (e) => {
    e.preventDefault();
    if (!selectedSectionId) {
      alert("No section selected for update.");
      return;
    }
    try {
      await updateDoc(doc(db, "Sections", selectedSectionId), {
        sectionName: section.sectionName,
        yearLevel: section.yearLevel,
      });
      console.log("Section updated successfully!");
      setSection({
        sectionName: '',
        yearLevel: '',
      });
      setSelectedSectionId(null);
      fetchSections();
    } catch (error) {
      alert("Error updating section.");
      console.error(error);
    }
  };

  const handleRowClick = (sec, id) => {
    setSection(sec);
    setSelectedSectionId(id);
  };

  // FETCH SECTIONS FROM COLLECTION
  const fetchSections = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Sections"));
      const sectionsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSections(sectionsList);
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  // CLIENT-SIDE FILTERING
  const filteredSections = sections.filter(sec => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      (sec.sectionName && sec.sectionName.toLowerCase().includes(lowerCaseQuery)) ||
      (sec.yearLevel && sec.yearLevel.toLowerCase().includes(lowerCaseQuery))
    );
  });

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <h2>Section List</h2>
        <input
          type="text"
          placeholder="Search Sections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            margin: '0px 0px 10px'
          }}
        />
        <table className='striped-table'>
          <thead>
            <tr>
              <th>Section</th>
              <th>Year Level</th>
            </tr>
          </thead>
          <tbody>
            {filteredSections.map((sec, index) => (
              <tr key={index} onClick={() => handleRowClick(sec, sec.id)}>
                <td>{sec.sectionName}</td>
                <td>{sec.yearLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <form id='submitSub' onSubmit={selectedSectionId ? updateSec : addSec}>
          <h2>Section Info</h2>

          <label className='addSubForm'>
            Section:
            <input
              type="text"
              name="sectionName"
              value={section.sectionName}
              onChange={handleChange}
            />
          </label>
          <label className='addSubForm'>
            Year Level:
            <select
              name='yearLevel'
              value={section.yearLevel}
              onChange={handleChange}>
              <option value="">Year Level</option>
              <option value="First Year">First Year</option>
              <option value="Second Year">Second Year</option>
              <option value="Third Year">Third Year</option>
              <option value="Fourth Year">Fourth Year</option>
              <option value="Irregular">Irregular</option>
            </select>
          </label>

          <div className="mb-3 text-center sec-crud">
            <button type="submit" className="sec-crud-btn btn btn-danger">
              {selectedSectionId ? 'Update Section' : 'Add Section'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default AddSection;
