import { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { useAuth } from '../../contexts/authContext'
import { Link, useNavigate } from 'react-router-dom'
import { doSignOut } from '../../firebase/auth'
import Offcanvas from 'react-bootstrap/Offcanvas';
import { Stack } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/ListGroup';

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
            <Stack gap={2} className="col-md mx-auto">
                
                Signed in as: {currentUser.displayName ? currentUser.displayName : currentUser.email}
                <ListGroup>
                    <ListGroup.Item>
                        Instructor Accounts
                    </ListGroup.Item>
                    <ListGroup.Item>
                        Student Accounts
                    </ListGroup.Item>
                </ListGroup> 
                <button 
                    id="gen_btn" 
                    className="btn btn-primary" 
                    onClick={() => { 
                        doSignOut().then(() => { 
                            console.log("User logged out successfully");
                            navigate('/login'); 
                        })
                        .catch((error) => console.error(error)); 
                    }}
                >Logout</button>
            </Stack>
            
            </Offcanvas.Body>
            </Offcanvas>
        </>
        
  )
}

export default Header