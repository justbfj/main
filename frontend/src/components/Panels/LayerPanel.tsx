import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  Slider,
  Fab,
  Card,
  CardContent,
  Chip,
  Collapse,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Delete,
  Visibility,
  VisibilityOff,
  ExpandLess,
  ExpandMore,
  CloudUpload,
  Layers,
  Palette,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { openDialog } from '../../store/slices/uiSlice';
import { updateLayer, removeLayer, setSelectedLayerId } from '../../store/slices/mapSlice';
import { setCurrentProject } from '../../store/slices/projectSlice';
import { Layer } from '../../store/api/projectApi';
import { getMockProjects, saveMockProjects } from '../../utils/mockApi';
import FileUploadDialog from '../Dialogs/FileUploadDialog';

const LayerPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dialogOpen, dialogType } = useAppSelector((state) => state.ui);
  const { selectedLayerId } = useAppSelector((state) => state.map);
  const { currentProject } = useAppSelector((state) => state.project);
  const layers = currentProject?.layers || [];
  const [expandedLayers, setExpandedLayers] = useState<string[]>([]);

  const handleUploadData = () => {
    dispatch(openDialog('uploadData'));
  };

  const handleToggleLayer = (layerId: string, visible: boolean) => {
    dispatch(updateLayer({ id: layerId, updates: { visible } }));
  };

  const handleOpacityChange = (layerId: string, opacity: number) => {
    dispatch(updateLayer({ id: layerId, updates: { opacity: opacity / 100 } }));
  };

  const handleDeleteLayer = (layerId: string) => {
    if (window.confirm('Are you sure you want to delete this layer?')) {
      if (currentProject) {
        // Remove layer from current project
        const updatedLayers = currentProject.layers.filter(layer => layer.id !== layerId);
        const updatedProject = { ...currentProject, layers: updatedLayers };
        
        // Update the project in storage and redux
        const projects = getMockProjects();
        const projectIndex = projects.findIndex(p => p.id === currentProject.id);
        if (projectIndex !== -1) {
          projects[projectIndex] = updatedProject;
          saveMockProjects(projects);
          dispatch(setCurrentProject(updatedProject));
        }
        
        // Also remove from map layer state
        dispatch(removeLayer(layerId));
        
        if (selectedLayerId === layerId) {
          dispatch(setSelectedLayerId(null));
        }
      }
    }
  };

  const handleSelectLayer = (layerId: string) => {
    dispatch(setSelectedLayerId(selectedLayerId === layerId ? null : layerId));
  };

  const toggleLayerExpanded = (layerId: string) => {
    setExpandedLayers(prev => 
      prev.includes(layerId)
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'vector':
        return <Layers />;
      case 'raster':
        return <Palette />;
      default:
        return <Layers />;
    }
  };

  const getFeatureCount = (layer: Layer): number => {
    return layer.data?.features?.length || 0;
  };

  const getLayerTypeColor = (type: string) => {
    switch (type) {
      case 'vector':
        return 'primary';
      case 'raster':
        return 'secondary';
      case 'terrain':
        return 'success';
      default:
        return 'default';
    }
  };

  const renderLayerList = () => {
    if (!currentProject) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Project Selected
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Select a project to manage layers
          </Typography>
        </Box>
      );
    }

    if (layers.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Layers Found
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Upload geospatial data to add layers to your project.
          </Typography>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={handleUploadData}
          >
            Upload Data
          </Button>
        </Box>
      );
    }

    return (
      <List sx={{ p: 0 }}>
        {layers.map((layer) => (
          <Card key={layer.id} sx={{ m: 1, mb: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {getLayerIcon(layer.type)}
                <Typography variant="subtitle1" sx={{ ml: 1, flexGrow: 1 }}>
                  {layer.name}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => toggleLayerExpanded(layer.id)}
                >
                  {expandedLayers.includes(layer.id) ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={layer.type}
                  size="small"
                  color={getLayerTypeColor(layer.type) as any}
                />
                <Chip
                  label={`${getFeatureCount(layer)} features`}
                  size="small"
                  variant="outlined"
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleLayer(layer.id, !layer.visible)}
                  >
                    {layer.visible ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                  <Switch
                    checked={layer.visible}
                    onChange={(e) => handleToggleLayer(layer.id, e.target.checked)}
                    size="small"
                  />
                </Box>

                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteLayer(layer.id)}
                >
                  <Delete />
                </IconButton>
              </Box>

              <Collapse in={expandedLayers.includes(layer.id)}>
                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="body2" gutterBottom>
                    Opacity: {Math.round(layer.opacity * 100)}%
                  </Typography>
                  <Slider
                    value={layer.opacity * 100}
                    onChange={(_, value) => handleOpacityChange(layer.id, value as number)}
                    min={0}
                    max={100}
                    step={5}
                    size="small"
                  />

                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ mt: 1 }}
                    onClick={() => handleSelectLayer(layer.id)}
                  >
                    {selectedLayerId === layer.id ? 'Deselect' : 'Select'} Layer
                  </Button>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        ))}
      </List>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5" gutterBottom>
          Layers
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage map layers and data visualization
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {renderLayerList()}
      </Box>

      {currentProject && (
        <Box sx={{ p: 2 }}>
          <Fab
            color="primary"
            aria-label="upload data"
            onClick={handleUploadData}
            sx={{ width: '100%', borderRadius: 1 }}
            variant="extended"
          >
            <CloudUpload sx={{ mr: 1 }} />
            Upload Data
          </Fab>
        </Box>
      )}

      {dialogOpen && dialogType === 'uploadData' && <FileUploadDialog />}
    </Box>
  );
};

export default LayerPanel;