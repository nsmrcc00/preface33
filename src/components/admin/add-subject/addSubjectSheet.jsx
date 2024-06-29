import { db } from '../../../firebase/firebase';
import React, { useState, useEffect } from "react";
import XLSX from 'xlsx';
import Header from '../../header/Header';

const AddSubjectSheet = () => {
  return (
    <>
      <header>
        <Header/>
      </header>
      <main>
        <section>          
        <input type="file" accept=".xlsx, .xls"/> 
        </section>
      </main>
      
    </>
  )
}

export default AddSubjectSheet
