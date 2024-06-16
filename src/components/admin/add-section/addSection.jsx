import { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebase';
import { doc, addDoc, updateDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import useSortableData from '../../table-sort/TableSort';

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

  // DELETE SECTION
  const deleteSec = async (e) => {
    e.preventDefault();
    if (!selectedSectionId) {
      alert("No section selected for deletion.");
      return;
    }
    const confirmed = window.confirm("Are you sure you want to delete this section?");
    if (!confirmed) {
      return;
    }
    try {
      await deleteDoc(doc(db, "Sections", selectedSectionId));
      console.log("Section deleted successfully!");
      setSection({
        sectionName: '',
        yearLevel: '',
      });
      setSelectedSectionId(null);
      fetchSections();
    } catch (error) {
      alert("Error deleting section.");
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

  const { items: sortedSections, requestSort, sortConfig } = useSortableData(filteredSections);

  const getClassNamesFor = (name) => {
      if (!sortConfig) {
          return;
      }
      return sortConfig.key === name ? sortConfig.direction : undefined;
  };
  return (
    <>
      <div className='table-container'>
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
              <th onClick={() => requestSort('section')} className={getClassNamesFor('section')}>Section</th>
              <th onClick={() => requestSort('yearLevel')} className={getClassNamesFor('yearLevel')}>Year Level</th>
            </tr>
          </thead>
          <tbody>
            {sortedSections.map((sec, index) => (
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
            {selectedSectionId && (
              <button type="button" className="sec-crud-btn btn btn-danger" onClick={deleteSec}>
                Delete Section
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}

export default AddSection;
