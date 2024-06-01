import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebase';
import { doc, setDoc, updateDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';

const AddSection = () => {
  const [section, setSection] = useState({
    sectionName: '',
    yearLevel: '',
  });

  const [sections, setSections] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSection({ ...section, [name]: value });
  };

  //ADD SECTION TO COLLECTION
  const addSec = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "Sections", section.title), {
        sectionName: section.sectionName,
        yearLevel: section.yearLevel,
      });
      console.log("section added successfully!");
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

  //UPDATE section
  const updateSec = async (title, updatedData) => {
    try {
      await updateDoc(doc(db, "Sections", title), updatedData);
      console.log("Section updated successfully!");
      setSection({
        sectionName: '',
        yearLevel: '',
      });
      fetchSections();
    } catch (error) {
      alert("Error updating section.");
      console.error(error);
    }
  };

  const handleRowClick = (sec) => {
    setSection(sec);
  };

  //FETCH SUBJECTS FROM COLLECTION
  const fetchSections = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Sections"));
      const sectionsList = querySnapshot.docs.map(doc => doc.data());
      setSections(sectionsList);
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  //CLIENT-SIDE FILTERING
  const filteredSections = sections.filter(sec => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return ((sec.sectionName && sec.sectionName.toLowerCase().includes(lowerCaseQuery) ||
             sec.yearLevel && sec.yearLevel.toLowerCase().includes(lowerCaseQuery))
    );
  });

  return (
    <>
    <div style={{overflowX: 'auto'}}>
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
                <tr key={index} onClick={() => handleRowClick(sec)}>
                  <td>{sec.sectionName}</td>
                  <td>{sec.yearLevel}</td>
                </tr>
              ))}
            </tbody>
        </table>

    
        <form id='submitSub' onSubmit={addSec}>
            <h2>Section Info</h2>
            
            <label className='addSubForm'>
                Section:
                <input 
                    type="text"
                    name="section"
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
                    <option>Year Level</option>
                    <option>First Year</option>
                    <option>Second Year</option>
                    <option>Third Year</option>
                    <option>Fourth Year</option>
                    <option>Irregular</option>
                </select>
            </label>       
            
            <div className="mb-3 text-center sec-crud">
            <button type="submit" className="sec-crud-btn btn btn-danger">
                Add Section
            </button>
            <button
                type="button"
                onClick={() => updateSec(section.sectionName, {
                    sectionName: section.sectionName,
                    yearLevel: section.yearLevel,
                  })} 
                className="sec-crud-btn btn btn-danger">
                Update Section
            </button>

            </div>

        </form>
    </div>
    </>    
    )
}

export default AddSection;