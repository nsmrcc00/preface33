import React from 'react'

const AddSection = () => {
  return (
    <>
    <div>
    <form id='addStudentInfo'>
        <label>
          <h2>Student Info</h2>
        </label>
        <input className="form-control" type="text" placeholder="Section"/>
        <input className="form-control" type="text" placeholder="Middle Name (Optional)"/>

        <div className="mb-3 text-center acc-crud">
          <button type="submit" className="acc-crud-btn btn btn-danger">
            Add Section
          </button>
          <button type="button" className="acc-crud-btn btn btn-danger">
            Update Section
          </button>
          <button type="button" className="acc-crud-btn btn btn-danger">
            Delete Section
          </button>
        </div>
        
      </form>
    </div>
    </>    
  )
}

export default AddSection
