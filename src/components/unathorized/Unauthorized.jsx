import { useEffect } from "react"
import { doSignOut } from "../../firebase/auth";
import { useAuth } from "../../contexts/authContext";

const Unauthorized = () => {

  const { userLoggedIn } = useAuth()
  useEffect(() => {
    const handleBeforeUnload = async () => {
        if (userLoggedIn) {
            await doSignOut();
        }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userLoggedIn]);

  return (
    <>
        <main>
        <section>
            <div
              style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
                <h1 style={{fontSize: '10rem'}}>403</h1>
                <h1>FORBIDDEN</h1>
                <p>You don't have permission to access this page.</p>
            </div>
        </section>
        </main> 
    </>
  )
}

export default Unauthorized
