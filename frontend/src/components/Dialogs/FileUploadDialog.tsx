import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  CloudUpload,
  InsertDriveFile,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { closeDialog, showSnackbar } from '../../store/slices/uiSlice';
import { addLayer } from '../../store/slices/mapSlice';
import { setCurrentProject } from '../../store/slices/projectSlice';
import { useUploadGeospatialDataMutation } from '../../store/api/projectApi';
import { uploadMockGeospatialData, getMockProjects } from '../../utils/mockApi';

interface UploadFile {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

const SUPPORTED_FORMATS = [
  '.csv', '.geojson', '.json', '.kml', '.kmz', '.shp', '.zip', '.gpx'
];

const FileUploadDialog: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentProject } = useAppSelector((state) => state.project);
  const [uploadGeospatialData] = useUploadGeospatialDataMutation();
  
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      status: 'pending' as const,
      progress: 0,
    }));
    setUploadFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json', '.geojson'],
      'application/vnd.google-earth.kml+xml': ['.kml'],
      'application/vnd.google-earth.kmz': ['.kmz'],
      'application/x-esri-shape': ['.shp'],
      'application/zip': ['.zip'],
      'application/gpx+xml': ['.gpx'],
    },
    multiple: true,
  });

  const handleUpload = async () => {
    if (!currentProject) {
      dispatch(showSnackbar({ 
        message: 'No project selected', 
        severity: 'error' 
      }));
      return;
    }

    setIsUploading(true);

    for (let i = 0; i < uploadFiles.length; i++) {
      const uploadFile = uploadFiles[i];
      if (uploadFile.status !== 'pending') continue;

      try {
        // Update status to uploading
        setUploadFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'uploading' as const } : f
        ));

        const result = await uploadMockGeospatialData(currentProject.id, uploadFile.file);

        // Add the new layer to the map
        dispatch(addLayer(result));

        // Refresh the current project to show updated layers
        const projects = getMockProjects();
        const updatedProject = projects.find(p => p.id === currentProject.id);
        if (updatedProject) {
          dispatch(setCurrentProject(updatedProject));
        }

        // Update status to success
        setUploadFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'success' as const, progress: 100 } : f
        ));

        dispatch(showSnackbar({ 
          message: `Successfully uploaded ${uploadFile.file.name}`, 
          severity: 'success' 
        }));

      } catch (error) {
        // Update status to error
        setUploadFiles(prev => prev.map((f, idx) => 
          idx === i ? { 
            ...f, 
            status: 'error' as const, 
            error: error instanceof Error ? error.message : 'Upload failed'
          } : f
        ));

        dispatch(showSnackbar({ 
          message: `Failed to upload ${uploadFile.file.name}`, 
          severity: 'error' 
        }));
      }
    }

    setIsUploading(false);
  };

  const handleRemoveFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    if (!isUploading) {
      dispatch(closeDialog());
      setUploadFiles([]);
    }
  };

  const getFileIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <InsertDriveFile />;
    }
  };

  const getStatusChip = (uploadFile: UploadFile) => {
    switch (uploadFile.status) {
      case 'pending':
        return <Chip label="Ready" size="small" />;
      case 'uploading':
        return <Chip label="Uploading..." size="small" color="primary" />;
      case 'success':
        return <Chip label="Complete" size="small" color="success" />;
      case 'error':
        return <Chip label="Failed" size="small" color="error" />;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog 
      open={true} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>
        Upload Geospatial Data
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Supported formats: {SUPPORTED_FORMATS.join(', ')}
          </Alert>

          <Box
            {...getRootProps()}
            sx={{
              border: 2,
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderStyle: 'dashed',
              borderRadius: 1,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? 'primary.light' : 'background.default',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.light',
              },
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              or click to select files
            </Typography>
          </Box>
        </Box>

        {uploadFiles.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Files to Upload ({uploadFiles.length})
            </Typography>
            <List>
              {uploadFiles.map((uploadFile, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {getFileIcon(uploadFile.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={uploadFile.file.name}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {formatFileSize(uploadFile.file.size)}
                        </Typography>
                        {uploadFile.status === 'uploading' && (
                          <LinearProgress 
                            variant="indeterminate" 
                            sx={{ mt: 1, maxWidth: 200 }} 
                          />
                        )}
                        {uploadFile.error && (
                          <Typography variant="caption" color="error">
                            {uploadFile.error}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusChip(uploadFile)}
                    {!isUploading && uploadFile.status === 'pending' && (
                      <Button
                        size="small"
                        onClick={() => handleRemoveFile(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={isUploading}>
          {uploadFiles.some(f => f.status === 'success') ? 'Close' : 'Cancel'}
        </Button>
        <Button 
          onClick={handleUpload} 
          variant="contained"
          disabled={uploadFiles.length === 0 || isUploading || !currentProject}
        >
          Upload Files
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileUploadDialog;