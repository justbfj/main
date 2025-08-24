import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
} from '@mui/material';
import {
  CloudQueue,
  AirplanemodeActive,
  ExpandMore,
  Analytics,
  Warning,
  CheckCircle,
  Schedule,
  Thermostat,
  Air,
  Visibility,
  WbSunny,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { showSnackbar } from '../../store/slices/uiSlice';
import { useAnalyzeProjectMutation } from '../../store/api/projectApi';

const AnalysisPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentProject } = useAppSelector((state) => state.project);
  const [analyzeProject, { isLoading: isAnalyzing }] = useAnalyzeProjectMutation();
  
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    start: dayjs(),
    end: dayjs().add(7, 'days'),
  });

  const handleAnalyze = async () => {
    if (!currentProject) {
      dispatch(showSnackbar({ 
        message: 'No project selected', 
        severity: 'error' 
      }));
      return;
    }

    try {
      const result = await analyzeProject({
        projectId: currentProject.id,
        dateRange: {
          start: dateRange.start.toISOString(),
          end: dateRange.end.toISOString(),
        },
      }).unwrap();

      setAnalysisData(result);
      dispatch(showSnackbar({ 
        message: 'Analysis completed successfully', 
        severity: 'success' 
      }));
    } catch (error) {
      dispatch(showSnackbar({ 
        message: 'Analysis failed', 
        severity: 'error' 
      }));
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderWeatherAnalysis = () => {
    if (!analysisData?.weather) return null;

    const { climate, forecast, hazards, recommendations } = analysisData.weather;

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CloudQueue sx={{ mr: 1 }} />
            <Typography variant="h6">Weather Analysis</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Thermostat sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h6">
                  {climate?.temperature?.avg || 'N/A'}°C
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Avg Temperature
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Air sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h6">
                  {climate?.wind?.speed || 'N/A'} km/h
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Wind Speed
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Visibility sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h6">
                  {climate?.visibility?.average || 'N/A'} km
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Visibility
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <WbSunny sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h6">
                  {climate?.precipitation?.probability || 'N/A'}%
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Precipitation
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Weather Hazards
          </Typography>
          <Grid container spacing={1}>
            {Object.entries(hazards || {}).map(([hazard, risk]) => (
              <Grid item key={hazard}>
                <Chip
                  label={`${hazard}: ${risk}`}
                  color={getRiskColor(risk as string) as any}
                  size="small"
                />
              </Grid>
            ))}
          </Grid>

          {recommendations?.optimalWindows?.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Optimal Flight Windows
              </Typography>
              <List dense>
                {recommendations.optimalWindows.slice(0, 3).map((window: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Window ${index + 1}`}
                      secondary={`${window.start} - ${window.end}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderAirspaceAnalysis = () => {
    if (!analysisData?.airspace) return null;

    const { restrictions, traffic, airspace, compliance } = analysisData.airspace;

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AirplanemodeActive sx={{ mr: 1 }} />
            <Typography variant="h6">Airspace Analysis</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Alert 
                severity={restrictions?.temporary?.length > 0 ? "warning" : "success"}
                sx={{ mb: 2 }}
              >
                {restrictions?.temporary?.length || 0} temporary flight restrictions active
              </Alert>
            </Grid>

            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="h6">
                  {traffic?.density || 'Low'}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Traffic Density
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="h6">
                  {airspace?.clearanceRequired ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Clearance Required
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {restrictions?.permanent?.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Permanent Restrictions
              </Typography>
              <List dense>
                {restrictions.permanent.slice(0, 3).map((restriction: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={restriction.name || `Restriction ${index + 1}`}
                      secondary={restriction.description || 'Check NOTAM for details'}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {compliance?.requirements?.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Compliance Requirements
              </Typography>
              <List dense>
                {compliance.requirements.slice(0, 3).map((req: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircle color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={req.title || `Requirement ${index + 1}`}
                      secondary={req.description || 'See regulations for details'}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!currentProject) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" gutterBottom>
            Analysis
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Weather and airspace intelligence
          </Typography>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Analytics sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No Project Selected
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Select a project to view analysis
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" gutterBottom>
            Analysis
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Weather and airspace intelligence
          </Typography>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Analysis Parameters
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <DatePicker
                    label="Start Date"
                    value={dateRange.start}
                    onChange={(date) => date && setDateRange(prev => ({ ...prev, start: date }))}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DatePicker
                    label="End Date"
                    value={dateRange.end}
                    onChange={(date) => date && setDateRange(prev => ({ ...prev, end: date }))}
                    minDate={dateRange.start.add(1, 'day')}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                fullWidth
                startIcon={isAnalyzing ? <CircularProgress size={20} /> : <Analytics />}
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
              </Button>
            </CardActions>
          </Card>

          {isAnalyzing && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography variant="h6">Analysis in Progress</Typography>
                </Box>
                <LinearProgress />
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Gathering weather data and analyzing airspace...
                </Typography>
              </CardContent>
            </Card>
          )}

          {analysisData && (
            <>
              {renderWeatherAnalysis()}
              {renderAirspaceAnalysis()}
            </>
          )}

          {!analysisData && !isAnalyzing && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Analytics sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No Analysis Data
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Run an analysis to view weather and airspace intelligence
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default AnalysisPanel;