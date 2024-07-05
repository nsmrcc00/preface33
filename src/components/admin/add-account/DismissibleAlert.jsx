import React, { useState } from 'react';
import { Alert } from 'react-bootstrap';

const DismissibleAlert = ({ message, variant, onClose }) => {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <Alert variant={variant} onClose={() => { setShow(false); onClose(); }} dismissible>
      {message}
    </Alert>
  );
};

export default DismissibleAlert;
