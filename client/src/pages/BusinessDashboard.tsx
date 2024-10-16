import { useState } from 'react';
import dayjs from 'dayjs';
import { Container, TextField, Button, Typography } from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BusinessDashboard: React.FC = () => {
    const { userRole, emailVerified } = useAuth();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [foodType, setFoodType] = useState('');
    const [menuLink, setMenuLink] = useState('');
    const [schedule, setSchedule] = useState([{ address: '', day: '', startTime: '', endTime: '' }]);
  
    const handleAddSchedule = () => {
      setSchedule([...schedule, { address: '', day: '', startTime: '', endTime: '' }]);
    };
  
    const handleScheduleChange = (index: number, field: string, value: string) => {
      const updatedSchedule = schedule.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      setSchedule(updatedSchedule);
    };
  
    const handleSameAsAbove = (index: number) => {
      if (index > 0) {
        const prevItem = schedule[index - 1];
        const updatedSchedule = schedule.map((item, i) =>
          i === index ? { ...item, address: prevItem.address, startTime: prevItem.startTime, endTime: prevItem.endTime } : item
        );
        setSchedule(updatedSchedule);
      }
    };
  
    const handleDetailsSubmit = async () => {
      if (userRole !== 'business' || !emailVerified) {
        alert('You must be a verified business to update your food truck information.');
        return;
      }
  
      try {
        const response = await axios.post('http://localhost:5000/api/foodtrucks/update-details', {
          name,
          description,
          foodType,
          menuLink,
        });
        if (response.status === 200) {
          alert('Food truck details updated successfully!');
        }
      } catch (error) {
        console.error('Error updating food truck details:', error);
        alert('Failed to update food truck details. Please try again.');
      }
    };
  
    const handleScheduleSubmit = async () => {
      if (userRole !== 'business' || !emailVerified) {
        alert('You must be a verified business to update your schedule.');
        return;
      }
  
      try {
        const response = await axios.post('http://localhost:5000/api/foodtrucks/update-schedule', {
          schedule,
        });
        if (response.status === 200) {
          alert('Schedule updated successfully!');
        }
      } catch (error) {
        console.error('Error updating schedule:', error);
        alert('Failed to update schedule. Please try again.');
      }
    };
  
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom>
            Business Dashboard
          </Typography>
  
          <Typography variant="h6" gutterBottom>
            Food Truck Details
          </Typography>
          <TextField
            label="Food Truck Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: '20px' }}
          />
          <TextField
            label="Description"
            variant="outlined"
            multiline
            rows={4}
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ marginBottom: '20px' }}
          />
          <TextField
            label="Food Type"
            variant="outlined"
            fullWidth
            value={foodType}
            onChange={(e) => setFoodType(e.target.value)}
            style={{ marginBottom: '20px' }}
          />
          <TextField
            label="Menu Link"
            variant="outlined"
            fullWidth
            value={menuLink}
            onChange={(e) => setMenuLink(e.target.value)}
            style={{ marginBottom: '20px' }}
          />
          <Button variant="contained" color="primary" onClick={handleDetailsSubmit} style={{ marginBottom: '40px', display: 'block' }}> 
            Update Details
          </Button>
  
          <Typography variant="h6" gutterBottom>
            Schedule and Location
          </Typography>
          {schedule.map((item, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <TextField
                label="Address"
                variant="outlined"
                fullWidth
                value={item.address}
                onChange={(e) => handleScheduleChange(index, 'address', e.target.value)}
                style={{ marginBottom: '10px' }}
              />
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <DatePicker
                  label="Date"
                  value={item.day ? dayjs(item.day) : null}
                  onChange={(newValue) => handleScheduleChange(index, 'day', newValue ? newValue.format('YYYY-MM-DD') : '')}
                  sx={{ flex: 1 }}
                />
                <TimePicker
                  label="Start Time"
                  value={item.startTime ? dayjs(item.startTime, 'HH:mm') : null}
                  onChange={(newValue) => handleScheduleChange(index, 'startTime', newValue ? newValue.format('HH:mm') : '')}
                  minutesStep={15}
                  sx={{ flex: 1 }}
                />
                <TimePicker
                  label="End Time"
                  value={item.endTime ? dayjs(item.endTime, 'HH:mm') : null}
                  onChange={(newValue) => handleScheduleChange(index, 'endTime', newValue ? newValue.format('HH:mm') : '')}
                  minutesStep={15}
                  sx={{ flex: 1 }}
                />
                {index > 0 && (
                  <Button variant="outlined" onClick={() => handleSameAsAbove(index)} sx={{ marginLeft: '10px' }}>
                    Same as Above
                  </Button>
                )}
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <Button variant="outlined" onClick={handleAddSchedule}>
              Add Another Schedule
            </Button>
            <Button variant="contained" color="primary" onClick={handleScheduleSubmit}>
              Update Schedule
            </Button>
          </div>
        </Container>
      </LocalizationProvider>
    );
  };
  
  export default BusinessDashboard;