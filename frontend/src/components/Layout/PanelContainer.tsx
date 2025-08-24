import React from 'react';
import { Box, Paper } from '@mui/material';
import { useAppSelector } from '../../hooks/redux';
import ProjectPanel from '../Panels/ProjectPanel';
import LayerPanel from '../Panels/LayerPanel';
import AnalysisPanel from '../Panels/AnalysisPanel';
import FlightPlanPanel from '../Panels/FlightPlanPanel';

const PanelContainer: React.FC = () => {
  const { activePanel } = useAppSelector((state) => state.ui);

  if (!activePanel) return null;

  const renderPanel = () => {
    switch (activePanel) {
      case 'projects':
        return <ProjectPanel />;
      case 'layers':
        return <LayerPanel />;
      case 'analysis':
        return <AnalysisPanel />;
      case 'flightplan':
        return <FlightPlanPanel />;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        width: 400,
        height: '100%',
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 1000,
        pointerEvents: 'auto',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {renderPanel()}
      </Paper>
    </Box>
  );
};

export default PanelContainer;