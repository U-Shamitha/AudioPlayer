import styled from 'styled-components';
import { primaryColor } from '../values/colors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css'
import { useSelector } from 'react-redux';

const StyledNav = styled.nav`
  background-color: ${primaryColor};
  color: white;
  height: 60px;
  padding: 0px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Add box shadow */
  position: sticky;
  top: 0; /* Stick to the top */
  z-index: 1000; /* Add z-index to ensure it appears above other elements */
//   border-radius: 0px 0px 10px 10px;
`;

const Navbar = ({toggleSidebar}) =>{
    
    const {activeTab} = useSelector((state)=> state.user);
    // console.log("activeTab", activeTab)

    return(
        <StyledNav>
            <div style={{display:'flex', gap:'40px', height:'60px', alignItems:'center', margin:'0px'}}>
                <FontAwesomeIcon icon={faBars}  onClick={toggleSidebar} size='lg' style={{padding:'10px'}} id="menu-icon"/>
                <Link to="/home" className={activeTab==="home" ? 'activeTab':''}><p className='nav-link-txt'>Home</p></Link>
            </div>
            <Link to="/"><p className='nav-link-txt'>E COMMERCE</p></Link>
        </StyledNav>
    )
}

export default Navbar;
