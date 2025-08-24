import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { closeDialog, showSnackbar } from '../../store/slices/uiSlice';
import { setCurrentProject } from '../../store/slices/projectSlice';
import { 
  useCreateProjectMutation, 
  useUpdateProjectMutation,
  Project 
} from '../../store/api/projectApi';
import { createMockProject, updateMockProject } from '../../utils/mockApi';

const CreateProjectDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentProject } = useAppSelector((state) => state.project);
  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();

  const isEditing = !!currentProject;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: dayjs(),
    endDate: dayjs().add(7, 'days'),
    units: 'metric' as 'metric' | 'imperial',
  });

  useEffect(() => {
    if (currentProject) {
      setFormData({
        name: currentProject.name,
        description: currentProject.description,
        startDate: dayjs(currentProject.dateRange.start),
        endDate: dayjs(currentProject.dateRange.end),
        units: currentProject.settings.units,
      });
    }
  }, [currentProject]);

  const handleClose = () => {
    dispatch(closeDialog());
    if (isEditing) {
      dispatch(setCurrentProject(null));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      dispatch(showSnackbar({ 
        message: 'Project name is required', 
        severity: 'error' 
      }));
      return;
    }

    try {
      const projectData = {
        name: formData.name,
        description: formData.description,
        dateRange: {
          start: formData.startDate.toISOString(),
          end: formData.endDate.toISOString(),
        },
        boundingBox: [-180, -90, 180, 90], // Default global bbox
        settings: {
          mapCenter: [39.8283, -98.5795] as [number, number],
          mapZoom: 4,
          units: formData.units,
        },
      };

      if (isEditing && currentProject) {
        const updatedProject = updateMockProject(currentProject.id, projectData);
        if (updatedProject) {
          dispatch(setCurrentProject(updatedProject));
          dispatch(showSnackbar({ 
            message: 'Project updated successfully', 
            severity: 'success' 
          }));
        }
      } else {
        const newProject = createMockProject(projectData);
        dispatch(setCurrentProject(newProject));
        dispatch(showSnackbar({ 
          message: 'Project created successfully', 
          severity: 'success' 
        }));
      }

      handleClose();
    } catch (error) {
      dispatch(showSnackbar({ 
        message: `Failed to ${isEditing ? 'update' : 'create'} project`, 
        severity: 'error' 
      }));
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog 
        open={true} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {isEditing ? 'Edit Project' : 'Create New Project'}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Project Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
            />
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              fullWidth
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(date) => date && setFormData(prev => ({ ...prev, startDate: date }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
              
              <DatePicker
                label="End Date"
                value={formData.endDate}
                onChange={(date) => date && setFormData(prev => ({ ...prev, endDate: date }))}
                minDate={formData.startDate.add(1, 'day')}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>
            
            <FormControl fullWidth>
              <InputLabel>Units</InputLabel>
              <Select
                value={formData.units}
                onChange={(e) => setFormData(prev => ({ ...prev, units: e.target.value as 'metric' | 'imperial' }))}
                label="Units"
              >
                <MenuItem value="metric">Metric (km, m, °C)</MenuItem>
                <MenuItem value="imperial">Imperial (mi, ft, °F)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CreateProjectDialog;