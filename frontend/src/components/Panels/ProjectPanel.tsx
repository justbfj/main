import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Fab,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  FolderOpen,
  DateRange,
  LocationOn,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { openDialog } from '../../store/slices/uiSlice';
import { setCurrentProject } from '../../store/slices/projectSlice';
import { 
  useGetProjectsQuery, 
  useDeleteProjectMutation,
  Project 
} from '../../store/api/projectApi';
import { getMockProjects, deleteMockProject } from '../../utils/mockApi';
import CreateProjectDialog from '../Dialogs/CreateProjectDialog';

const ProjectPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dialogOpen, dialogType } = useAppSelector((state) => state.ui);
  const { currentProject } = useAppSelector((state) => state.project);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load mock projects
    const mockProjects = getMockProjects();
    setProjects(mockProjects);
    setIsLoading(false);
  }, []);

  // Refresh projects when dialog closes
  useEffect(() => {
    if (!dialogOpen) {
      const mockProjects = getMockProjects();
      setProjects(mockProjects);
    }
  }, [dialogOpen]);
  const [deleteProject] = useDeleteProjectMutation();

  const handleCreateProject = () => {
    dispatch(openDialog('createProject'));
  };

  const handleSelectProject = (project: Project) => {
    dispatch(setCurrentProject(project));
  };

  const handleEditProject = (project: Project) => {
    dispatch(setCurrentProject(project));
    dispatch(openDialog('createProject'));
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const success = deleteMockProject(projectId);
        if (success) {
          const updatedProjects = getMockProjects();
          setProjects(updatedProjects);
          
          if (currentProject?.id === projectId) {
            dispatch(setCurrentProject(null));
          }
        }
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderProjectList = () => {
    if (isLoading) {
      return (
        <Box sx={{ p: 2 }}>
          {[1, 2, 3].map((i) => (
            <Card key={i} sx={{ mb: 2 }}>
              <CardContent>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="60%" height={16} />
                <Skeleton variant="text" width="40%" height={16} />
              </CardContent>
            </Card>
          ))}
        </Box>
      );
    }


    if (!projects || projects.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Projects Found
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Create your first flight planning project to get started.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateProject}
          >
            Create Project
          </Button>
        </Box>
      );
    }

    return (
      <Box sx={{ p: 1 }}>
        {projects.map((project) => (
          <Card 
            key={project.id} 
            sx={{ 
              mb: 2, 
              cursor: 'pointer',
              border: currentProject?.id === project.id ? 2 : 1,
              borderColor: currentProject?.id === project.id ? 'primary.main' : 'divider',
            }}
            onClick={() => handleSelectProject(project)}
          >
            <CardContent sx={{ pb: 1 }}>
              <Typography variant="h6" gutterBottom>
                {project.name}
              </Typography>
              
              {project.description && (
                <Typography variant="body2" color="textSecondary" paragraph>
                  {project.description}
                </Typography>
              )}

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip
                  icon={<DateRange />}
                  label={`${formatDate(project.dateRange.start)} - ${formatDate(project.dateRange.end)}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  icon={<LocationOn />}
                  label={`${project.layers.length} layers`}
                  size="small"
                  variant="outlined"
                />
              </Box>

              <Typography variant="caption" color="textSecondary">
                Created: {formatDate(project.createdAt)}
              </Typography>
            </CardContent>
            
            <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditProject(project);
                }}
              >
                <Edit />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(project.id);
                }}
              >
                <Delete />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5" gutterBottom>
          Projects
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage your flight planning projects
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {renderProjectList()}
      </Box>

      <Box sx={{ p: 2 }}>
        <Fab
          color="primary"
          aria-label="create project"
          onClick={handleCreateProject}
          sx={{ width: '100%', borderRadius: 1 }}
          variant="extended"
        >
          <Add sx={{ mr: 1 }} />
          New Project
        </Fab>
      </Box>

      {dialogOpen && dialogType === 'createProject' && <CreateProjectDialog />}
    </Box>
  );
};

export default ProjectPanel;