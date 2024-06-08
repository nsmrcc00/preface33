import { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { useAuth } from '../../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import { doSignOut } from '../../firebase/auth';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { Stack } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/ListGroup';
import { db } from '../../firebase/firebase';
import { collection, getDocs, doc } from 'firebase/firestore';

function InstructorHeader() {
    const navigate = useNavigate();
    const { userLoggedIn, currentUser } = useAuth();
    const [show, setShow] = useState(false);
    const [unloading, setUnloading] = useState(false);
    const [subjects, setSubjects] = useState([]);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const navi1 = () => {
        if (userLoggedIn === true) {
          navigate('/subject');
        } else {
          doSignOut();
          navigate('/login');
        }
      };

    useEffect(() => {
        const fetchSubjects = async () => {
            if (currentUser) {
                const cachedSubjects = localStorage.getItem('instructorSubjects');
                const cacheExpiration = localStorage.getItem('instructorSubjectsExpiration');
                
                if (cachedSubjects && cacheExpiration && new Date() < new Date(cacheExpiration)) {
                    setSubjects(JSON.parse(cachedSubjects));
                } else {
                    const userDoc = doc(db, 'Users', currentUser.uid);
                    const subjectsCollection = collection(userDoc, 'subjectsHandled');
                    const subjectsSnapshot = await getDocs(subjectsCollection);
                    const subjectsList = subjectsSnapshot.docs.map(doc => ({
                        title: doc.data().title,
                        section: doc.data().section
                    }));
                    
                    setSubjects(subjectsList);
                    localStorage.setItem('instructorSubjects', JSON.stringify(subjectsList));
                    localStorage.setItem('instructorSubjectsExpiration', new Date(new Date().getTime() + 60 * 60 * 1000)); // Cache for 1 hour
                }
            }
        };

        fetchSubjects();
    }, [currentUser]);

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

    const navi3 = () => {
        if (userLoggedIn === true) {
            navigate('/instructor-home');
        }
    };

    return (
        <>
            <header>
                <Navbar id="heading">
                    <Container fluid>                    
                        <Navbar.Brand href="#" onClick={handleShow}>
                            <img src='hamburger.svg' alt="Menu"/>
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
                            {subjects.map((subject, index) => (
                                <ListGroup.Item key={index} action onClick={navi1}>
                                    {subject.title} - {subject.section}
                                </ListGroup.Item>
                            ))}
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
    );
}

export default InstructorHeader;
