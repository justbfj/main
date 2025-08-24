import React from 'react';
import {
  Box,
  CssBaseline,
  ThemeProvider,
} from '@mui/material';
import { useAppSelector } from '../../hooks/redux';
import { lightTheme, darkTheme } from '../../theme/theme';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import NotificationSnackbar from './NotificationSnackbar';

const AppLayout: React.FC = () => {
  const { theme } = useAppSelector((state) => state.ui);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <AppHeader />
        <Sidebar />
        <MainContent />
        <NotificationSnackbar />
      </Box>
    </ThemeProvider>
  );
};

export default AppLayout;