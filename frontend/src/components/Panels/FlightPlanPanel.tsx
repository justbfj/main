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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  TextField,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import {
  FlightTakeoff,
  Route,
  Schedule,
  Speed,
  LocalGasStation,
  Warning,
  CheckCircle,
  ExpandMore,
  Settings,
  TrendingUp,
  Map as MapIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { showSnackbar } from '../../store/slices/uiSlice';
import { useOptimizeFlightPlanMutation } from '../../store/api/projectApi';

interface OptimizationConstraints {
  maxFlightTime: number;
  weatherPriority: number;
  airspacePriority: number;
  fuelEfficiency: number;
  safetyMargin: number;
  preferredTimes: boolean;
}

const FlightPlanPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentProject } = useAppSelector((state) => state.project);
  const [optimizeFlightPlan, { isLoading: isOptimizing }] = useOptimizeFlightPlanMutation();
  
  const [flightPlan, setFlightPlan] = useState<any>(null);
  const [constraints, setConstraints] = useState<OptimizationConstraints>({
    maxFlightTime: 4, // hours
    weatherPriority: 7,
    airspacePriority: 8,
    fuelEfficiency: 6,
    safetyMargin: 8,
    preferredTimes: true,
  });

  const handleOptimize = async () => {
    if (!currentProject) {
      dispatch(showSnackbar({ 
        message: 'No project selected', 
        severity: 'error' 
      }));
      return;
    }

    if (currentProject.layers.length === 0) {
      dispatch(showSnackbar({ 
        message: 'No flight lines found. Please upload flight data first.', 
        severity: 'warning' 
      }));
      return;
    }

    try {
      const result = await optimizeFlightPlan({
        projectId: currentProject.id,
        constraints,
      }).unwrap();

      setFlightPlan(result);
      dispatch(showSnackbar({ 
        message: 'Flight plan optimized successfully', 
        severity: 'success' 
      }));
    } catch (error) {
      dispatch(showSnackbar({ 
        message: 'Flight plan optimization failed', 
        severity: 'error' 
      }));
    }
  };

  const handleConstraintChange = (key: keyof OptimizationConstraints, value: number | boolean) => {
    setConstraints(prev => ({ ...prev, [key]: value }));
  };

  const formatDuration = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return 'success';
    if (efficiency >= 60) return 'warning';
    return 'error';
  };

  const renderOptimizationSettings = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Settings sx={{ mr: 1 }} />
          <Typography variant="h6">Optimization Settings</Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Max Flight Time: {constraints.maxFlightTime} hours
            </Typography>
            <Slider
              value={constraints.maxFlightTime}
              onChange={(_, value) => handleConstraintChange('maxFlightTime', value as number)}
              min={1}
              max={12}
              step={0.5}
              marks
              valueLabelDisplay="auto"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Weather Priority: {constraints.weatherPriority}/10
            </Typography>
            <Slider
              value={constraints.weatherPriority}
              onChange={(_, value) => handleConstraintChange('weatherPriority', value as number)}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Airspace Priority: {constraints.airspacePriority}/10
            </Typography>
            <Slider
              value={constraints.airspacePriority}
              onChange={(_, value) => handleConstraintChange('airspacePriority', value as number)}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Fuel Efficiency: {constraints.fuelEfficiency}/10
            </Typography>
            <Slider
              value={constraints.fuelEfficiency}
              onChange={(_, value) => handleConstraintChange('fuelEfficiency', value as number)}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Safety Margin: {constraints.safetyMargin}/10
            </Typography>
            <Slider
              value={constraints.safetyMargin}
              onChange={(_, value) => handleConstraintChange('safetyMargin', value as number)}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={constraints.preferredTimes}
                  onChange={(e) => handleConstraintChange('preferredTimes', e.target.checked)}
                />
              }
              label="Use preferred flight times"
            />
          </Grid>
        </Grid>
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          fullWidth
          startIcon={isOptimizing ? <CircularProgress size={20} /> : <FlightTakeoff />}
          onClick={handleOptimize}
          disabled={isOptimizing}
        >
          {isOptimizing ? 'Optimizing...' : 'Optimize Flight Plan'}
        </Button>
      </CardActions>
    </Card>
  );

  const renderFlightPlanResults = () => {
    if (!flightPlan) return null;

    return (
      <>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Optimized Flight Plan
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <TrendingUp sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h6">
                    {flightPlan.efficiency || 85}%
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Efficiency
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Schedule sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h6">
                    {formatDuration(flightPlan.schedule?.totalTime || 6.5)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total Time
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Chip
              label={`Efficiency: ${flightPlan.efficiency || 85}%`}
              color={getEfficiencyColor(flightPlan.efficiency || 85) as any}
              sx={{ mr: 1, mb: 1 }}
            />
            <Chip
              label={`${flightPlan.route?.waypoints?.length || 12} waypoints`}
              variant="outlined"
              sx={{ mr: 1, mb: 1 }}
            />
            <Chip
              label={`${flightPlan.alternatives?.length || 2} alternatives`}
              variant="outlined"
              sx={{ mr: 1, mb: 1 }}
            />
          </CardContent>
        </Card>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Route sx={{ mr: 1 }} />
            <Typography variant="h6">Flight Route</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {(flightPlan.route?.segments || [
                { name: 'Segment 1', distance: '45.2 km', time: '1h 20m', conditions: 'Optimal' },
                { name: 'Segment 2', distance: '38.7 km', time: '1h 15m', conditions: 'Good' },
                { name: 'Segment 3', distance: '52.1 km', time: '1h 45m', conditions: 'Fair' },
              ]).map((segment: any, index: number) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <MapIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={segment.name}
                    secondary={`${segment.distance} • ${segment.time} • ${segment.conditions}`}
                  />
                  <Chip
                    size="small"
                    label={segment.conditions}
                    color={segment.conditions === 'Optimal' ? 'success' : 
                           segment.conditions === 'Good' ? 'primary' : 'warning'}
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Schedule sx={{ mr: 1 }} />
            <Typography variant="h6">Flight Schedule</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {(flightPlan.schedule?.flights || [
                { date: '2024-03-15', time: '08:00 - 11:30', weather: 'Clear', status: 'Optimal' },
                { date: '2024-03-16', time: '07:30 - 10:45', weather: 'Partly Cloudy', status: 'Good' },
                { date: '2024-03-17', time: '09:00 - 12:15', weather: 'Overcast', status: 'Acceptable' },
              ]).map((flight: any, index: number) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`Flight ${index + 1} - ${flight.date}`}
                    secondary={`${flight.time} • ${flight.weather}`}
                  />
                  <Chip
                    size="small"
                    label={flight.status}
                    color={flight.status === 'Optimal' ? 'success' : 
                           flight.status === 'Good' ? 'primary' : 'warning'}
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Warning sx={{ mr: 1 }} />
            <Typography variant="h6">Risk Assessment</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {Object.entries(flightPlan.risks || {
                weather: 'Low',
                airspace: 'Medium',
                technical: 'Low',
                operational: 'Low'
              }).map(([risk, level]) => (
                <Grid item xs={6} key={risk}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {risk}
                    </Typography>
                    <Chip
                      size="small"
                      label={level}
                      color={level === 'Low' ? 'success' : 
                             level === 'Medium' ? 'warning' : 'error'}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Card sx={{ mt: 2 }}>
          <CardActions sx={{ justifyContent: 'center' }}>
            <Button variant="outlined">
              Export Flight Plan
            </Button>
            <Button variant="contained">
              Apply to Map
            </Button>
          </CardActions>
        </Card>
      </>
    );
  };

  if (!currentProject) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" gutterBottom>
            Flight Planning
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Optimize flight routes and schedules
          </Typography>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <FlightTakeoff sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No Project Selected
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Select a project to optimize flight plans
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5" gutterBottom>
          Flight Planning
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Optimize flight routes and schedules
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {renderOptimizationSettings()}
        {renderFlightPlanResults()}

        {!flightPlan && !isOptimizing && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <FlightTakeoff sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No Flight Plan
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Configure optimization settings and run optimization
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FlightPlanPanel;