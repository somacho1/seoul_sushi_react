import { useEffect } from 'react'
import { useGlobalStore } from '../../store/store.js'
import { useNavigate } from 'react-router-dom'

const Member_Logout = () => {
  const navigate = useNavigate();

  const { setLogin, setId, setGrade, setMemberno } = useGlobalStore();

  useEffect(() => {

    setLogin(false);
    setId('');
    setGrade(99);
    setMemberno(0);

    navigate('/');

  }, []);

  return (
    <div>
      Employee_Logout
    </div>
  )
}

export default Member_Logout
