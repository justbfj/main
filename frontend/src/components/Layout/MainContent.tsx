import React from 'react';
import { Box } from '@mui/material';
import { useAppSelector } from '../../hooks/redux';
import LeafletMap from '../Map/LeafletMap';
import PanelContainer from './PanelContainer';

const MainContent: React.FC = () => {
  const { sidebarOpen, activePanel } = useAppSelector((state) => state.ui);

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        display: 'flex',
        height: 'calc(100vh - 64px)',
        marginTop: '64px',
        transition: 'margin-left 0.3s ease-in-out',
        marginLeft: sidebarOpen ? '280px' : 0,
      }}
    >
      <Box sx={{ 
        flex: 1, 
        position: 'relative',
        marginRight: activePanel ? '400px' : 0,
        transition: 'margin-right 0.3s ease-in-out',
      }}>
        <LeafletMap />
      </Box>
      
      <PanelContainer />
    </Box>
  );
};

export default MainContent;