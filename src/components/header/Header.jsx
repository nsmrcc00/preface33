import { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { useAuth } from '../../contexts/authContext'
import { Link, useNavigate } from 'react-router-dom'
import { doSignOut } from '../../firebase/auth'
import Offcanvas from 'react-bootstrap/Offcanvas';
import { Stack } from 'react-bootstrap';

function Header() {
    const navigate = useNavigate()
    const { currentUser } = useAuth()
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    
    return (
        <>
            <header>
            <Navbar id="heading">
                <Container fluid>                    
                    <Navbar.Brand href="#" onClick={handleShow}>
                        <img src='hamburger.svg'/>
                    </Navbar.Brand>            
                    <Navbar.Collapse className="justify-content-end">               
                    <Navbar.Brand href="#">
                        <img 
                            src='preface.png' 
                            alt="PreFace" 
                            width="135" 
                            height="30"                             
                        />
                    </Navbar.Brand>
                    </Navbar.Collapse>
                </Container>
            </Navbar>   
            </header>

            <Offcanvas className="header-off-canvas" show={show} onHide={handleClose}>
            <Offcanvas.Header closeButton>           
            </Offcanvas.Header>
            <Offcanvas.Body>
            <Stack gap={2} className="col-md-10 mx-auto">
                Signed in as: {currentUser.displayName ? currentUser.displayName : currentUser.email} 
                <button id="gen_btn" className="btn btn-primary" onClick={() => { doSignOut().then(() => { navigate('/login') }) }}>Logout</button>
            </Stack>
            
            </Offcanvas.Body>
            </Offcanvas>
        </>
        
  )
}

export default Header