import React, { useState, useRef, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from 'react-modal';
import "../subject/SubCalendar.css"

const localizer = momentLocalizer(moment);

const CustomToolbar = ({ label, onNavigate }) => (
  <div>
    <button onClick={() => onNavigate('TODAY')}>Today</button>
    <button onClick={() => onNavigate('PREV')}>Previous</button>
    <button onClick={() => onNavigate('NEXT')}>Next</button>
    <span>{label}</span>
  </div>
);

Modal.setAppElement('#root'); // Ensure screen readers are notified

const SubCalendar = () => {
  const [view, setView] = useState('month'); // Manage the view state
  const [modalVisible, setModalVisible] = useState(false); // Manage modal visibility
  const [selectedDate, setSelectedDate] = useState(null); // Manage the selected date
  const calendarRef = useRef(null); // Reference to the calendar

  useEffect(() => {
    // Toggle class on the body or another appropriate parent element
    if (modalVisible) {
      document.body.classList.add('hide-rbc-button-link');
    } else {
      document.body.classList.remove('hide-rbc-button-link');
    }

    // Cleanup function to remove the class if the component unmounts
    return () => {
      document.body.classList.remove('hide-rbc-button-link');
    };
  }, [modalVisible]);

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDate(null);
  };

  const afterOpenModal = () => {
    // Transfer focus to the modal
    const modalElement = document.querySelector('.ReactModal__Content');
    if (modalElement) {
      modalElement.focus();
    }
  };

  const afterCloseModal = () => {
    // Restore focus to the calendar
    if (calendarRef.current) {
      calendarRef.current.focus();
    }
  };

  return (
    <div className='table-container'>
      <div style={{ height: 500 }} ref={calendarRef} tabIndex={-1}>
        <Calendar
          localizer={localizer}
          events={[]}
          startAccessor="start"
          endAccessor="end"
          defaultDate={moment().toDate()}
          view={view} // Set the view state
          onView={() => setView('month')} // Prevent view changes
          selectable // Allow selecting a slot
          onSelectSlot={handleSelectSlot} // Handle slot selection
          components={{
            toolbar: CustomToolbar,
          }}
        />
      </div>
      <Modal
        isOpen={modalVisible}
        onRequestClose={closeModal}
        onAfterOpen={afterOpenModal}
        onAfterClose={afterCloseModal}
        contentLabel="Selected Date Modal"
      >
        <h2>Selected Date: {moment(selectedDate).format('MMMM Do YYYY')}</h2>
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
};

export default SubCalendar;
