import { useState,useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { useAuth } from '../../contexts/authContext'
import { useNavigate } from 'react-router-dom'
import { doSignOut } from '../../firebase/auth'
import Offcanvas from 'react-bootstrap/Offcanvas';
import { Stack } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/ListGroup';

function InstructorHeader() {
    const navigate = useNavigate()
    const { userLoggedIn,currentUser } = useAuth()
    const [show, setShow] = useState(false);
    const [unloading, setUnloading] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {
        const handleBeforeUnload = async (event) => {
            if (userLoggedIn) {
                setUnloading(true);
                await doSignOut();
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && !unloading) {
                window.addEventListener('beforeunload', handleBeforeUnload);
            } else {
                window.removeEventListener('beforeunload', handleBeforeUnload);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [userLoggedIn, unloading]);

    //navigate to instructor account page
    const navi1 = () => {
        if (userLoggedIn == true) {
            navigate('/instructor-accounts');
        }
        else {
            doSignOut();
            navigate('/login');
        }
    };

    //navigate to student account page
    const navi2 = () => {
        if (userLoggedIn == true) {
            navigate('/student-accounts');
        }
        else {
            doSignOut();
            navigate('/login');
        }
    };

    //navigate to home
    const navi3 = () => {
        if (userLoggedIn == true) {
            navigate('/instructor-home')
        }
    }
    
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
                            onClick={navi3}                             
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
                    <ListGroup.Item action onClick={navi1}>                        
                        Placeholder for Subject
                    </ListGroup.Item>
                    <ListGroup.Item action onClick={navi2}>
                        Placeholder for Subject
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

export default InstructorHeader