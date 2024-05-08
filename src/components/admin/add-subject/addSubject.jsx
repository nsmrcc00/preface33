import React, { useState, useEffect } from 'react'
import { db } from '../../../firebase/firebase';
import { doc, setDoc } from 'firebase/firestore'; 

const AddSubject = () => {

   

  const addSub = async (e) => {
    e.preventDefault();
    await setDoc(doc(db,"Subjects","subject4"), {
      instructor: "test name",
      schedule: "in there",
      title: "Agg"
  
    }); 
  }

  return (
    <>
    
    <button onClick={addSub}>Test</button>
    </>
  );
}

export default AddSubject