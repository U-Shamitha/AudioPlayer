import Navbar from './Navbar';
import Sidebar from './Sidebar';
import '../styles/Home.css'
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setIsSideBarOpen } from '../redux/userSlice';
import Upload from './AudioPlayer';
import AudioPlayer from './AudioPlayer';

const Home = () => {
  const isSidebarOpen = useSelector((state)=> state.user.isSideBarOpen);

  const dispatch = useDispatch();

  const toggleSidebar = () => {
    dispatch(setIsSideBarOpen(!isSidebarOpen));
  };

  return (
    <div>
      <Router>
        <Navbar toggleSidebar={toggleSidebar} />
        <Sidebar isopen={isSidebarOpen}/>
        <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <Routes>
            <Route path='/' element={<AudioPlayer/>}/>
            <Route path="/upload" element={<AudioPlayer/>}/>
          </Routes>
        </div>
    </Router>
    </div>
  );
};

export default Home;
