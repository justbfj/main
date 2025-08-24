import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Collapse,
} from '@mui/material';
import {
  Folder,
  Layers,
  Analytics,
  FlightTakeoff,
  ExpandLess,
  ExpandMore,
  Map,
  CloudQueue,
  AirplanemodeActive,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setActivePanel } from '../../store/slices/uiSlice';

const DRAWER_WIDTH = 280;

const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sidebarOpen, activePanel } = useAppSelector((state) => state.ui);
  const { currentProject } = useAppSelector((state) => state.project);
  const [expandedSections, setExpandedSections] = React.useState<string[]>(['projects']);

  const handlePanelClick = (panel: 'projects' | 'layers' | 'analysis' | 'flightplan') => {
    dispatch(setActivePanel(panel));
  };

  const handleSectionToggle = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const menuItems = [
    {
      section: 'projects',
      title: 'Project Management',
      icon: <Folder />,
      panel: 'projects' as const,
      subItems: []
    },
    {
      section: 'mapping',
      title: 'Mapping & Layers',
      icon: <Map />,
      panel: 'layers' as const,
      subItems: [
        { title: 'Layer Control', icon: <Layers />, panel: 'layers' as const },
      ]
    },
    {
      section: 'analysis',
      title: 'Intelligence Analysis',
      icon: <Analytics />,
      panel: 'analysis' as const,
      subItems: [
        { title: 'Weather Analysis', icon: <CloudQueue />, panel: 'analysis' as const },
        { title: 'Airspace Analysis', icon: <AirplanemodeActive />, panel: 'analysis' as const },
      ]
    },
    {
      section: 'flightplan',
      title: 'Flight Planning',
      icon: <FlightTakeoff />,
      panel: 'flightplan' as const,
      subItems: []
    },
  ];

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      open={sidebarOpen}
      sx={{
        width: sidebarOpen ? DRAWER_WIDTH : 0,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        transition: 'width 0.3s ease-in-out',
        '& .MuiDrawer-paper': {
          width: sidebarOpen ? DRAWER_WIDTH : 0,
          boxSizing: 'border-box',
          marginTop: '64px',
          height: 'calc(100vh - 64px)',
          overflow: 'hidden',
          transition: 'width 0.3s ease-in-out',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', py: 1 }}>
        <List>
          {menuItems
            .filter(item => item.section === 'projects' || currentProject) // Only show other panels if project exists
            .map((item) => (
              <React.Fragment key={item.section}>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={activePanel === item.panel}
                    onClick={() => {
                      handlePanelClick(item.panel);
                      if (item.subItems.length > 0) {
                        handleSectionToggle(item.section);
                      }
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.title} />
                    {item.subItems.length > 0 && (
                      expandedSections.includes(item.section) ? <ExpandLess /> : <ExpandMore />
                    )}
                  </ListItemButton>
                </ListItem>
                
                {item.subItems.length > 0 && (
                  <Collapse in={expandedSections.includes(item.section)} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subItems.map((subItem) => (
                        <ListItem key={subItem.title} disablePadding>
                          <ListItemButton
                            sx={{ pl: 4 }}
                            selected={activePanel === subItem.panel}
                            onClick={() => handlePanelClick(subItem.panel)}
                          >
                            <ListItemIcon>{subItem.icon}</ListItemIcon>
                            <ListItemText primary={subItem.title} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                )}
                
                {item.section !== 'flightplan' && currentProject && <Divider />}
              </React.Fragment>
            ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;