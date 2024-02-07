import styled from 'styled-components';
import { primaryColor } from '../values/colors';

const Sidebar=({isOpen})=>{

  const StyledSideBar = styled.aside`
  background-color: white;
  color: ${primaryColor};
  height: calc(100% - 61px);
  width: 300px;
  position: fixed;
  top: 61px;
  left: ${({ isOpen }) => (isOpen ? '0' : '-300px')};
  transition: left 0.3s ease-in-out;
  z-index: 999; /* Add z-index to ensure it appears above other elements */
  border-radius: 0px 8px 8px 0px;
  box-shadow: 1px 2px 8px rgba(0, 0, 0, 0.4);
`;

  return(
    <StyledSideBar isopen={isOpen}>

      <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
        {/* <center><p style={{display:'flex', backgroundColor:primaryColor, padding:'10px', height:'35px', color:'white', borderRadius:'4px', margin:'20px 10px 10px 10px', justifyContent:'center', alignItems:'center'}}>Filter Products</p></center> */}
      </div>

    </StyledSideBar>
  )
}

export default Sidebar;
