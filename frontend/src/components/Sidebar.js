import styled from 'styled-components';
import { primaryColor } from '../values/colors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const Sidebar=({isopen})=>{

  const StyledSideBar = styled.aside`
  background-color: white;
  color: ${primaryColor};
  height: calc(100% - 61px);
  width: 300px;
  position: fixed;
  top: 61px;
  left: ${({ isopen }) => (isopen ? '0' : '-300px')};
  transition: left 0.3s ease-in-out;
  z-index: 999; /* Add z-index to ensure it appears above other elements */
  border-radius: 0px 8px 8px 0px;
  box-shadow: 1px 2px 8px rgba(0, 0, 0, 0.4);
`;

  return(
    <StyledSideBar isopen={isopen}>

      <div style={{display:'flex', flexDirection:'column', gap:'15px', padding:'20px'}}>
        <Link to="/"><p style={{display:'flex', alignItems:'center', justifyContent:'center'}}><FontAwesomeIcon icon={faHome} color={primaryColor}/>&nbsp;Home</p></Link>
      </div>

    </StyledSideBar>
  )
}

export default Sidebar;
