import React, { useState } from 'react';
import axios from 'axios';
import { Container, Button, Checkbox, FormControlLabel, Select, MenuItem, TextField, Typography, Card, CardContent, CardActions, Grid, Alert, Snackbar, Box } from '@mui/material';
import Login from './Login';
import Register from './Register';

function App() {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState(null);
  const [jwtToken, setJwtToken] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [dateError, setDateError] = useState('');
  const [onlyNotBooked, setOnlyNotBooked] = useState(false);

  const fetchTickets = async (date, onlyNotBooked, maxPrice, sortByPrice, sortByTransfers, airlineName) => {
    try {
      const response = await axios.get('http://localhost:5115/fligts/get', {
        params: {
          date,
          onlyNotBooked,
          sortByPrice,
          maxPrice,
          sortByTransfers,
          airlineName
        }
      });
      setTickets(response.data.result);
      setError(null);
    } catch (error) {
      setError(error.response.data.error.message);
      setTickets([]);
    }
  };

  const bookTicket = async (ticketId, sourse) => {
    try {
      const response = await axios.post(`http://localhost:5115/fligts/book/${ticketId}/${sourse}`, {}, {
        headers: {
          Authorization: `Bearer ${jwtToken}`
        }
      });
      if (response.data.error !== undefined) {
        setError(response.data.error.message);
        return;
      }
      const updatedTickets = tickets.map(ticket => {
        if (ticket.originalId === ticketId) {
          return { ...ticket, isBooked: true };
        }
        return ticket;
      });
      setTickets(updatedTickets);
      setSuccessMessage('Ticket booked successfully!');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const date = formData.get('date');
    const maxPrice = formData.get('maxPrice');
    const sortByPrice = formData.get('sortByPrice') === 'ByPrice' ? 1 : 0;
    const sortByTransfers = formData.get('sortByTransfers') === 'ByTransfersCount' ? 1 : 0;
    const airlineName = formData.get('airlineName');

    if (!date) {
      setDateError('Date is required');
      return;
    } else {
      setDateError('');
    }

    fetchTickets(date, onlyNotBooked, maxPrice, sortByPrice, sortByTransfers, airlineName);
  };

  const handleLogin = (token) => {
    setJwtToken(token);
    setIsAuthenticated(true);
    setShowLogin(false);
    setShowRegister(false);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Ticket Booking App</Typography>
      {!isAuthenticated && (
        <Box display="flex" mb={2}>
          <Button onClick={() => { setShowLogin(true); setShowRegister(false); }} variant="contained" color="primary" style={{ marginRight: '10px' }}>Login</Button>
          <Button onClick={() => { setShowRegister(true); setShowLogin(false); }} variant="contained" color="secondary">Register</Button>
        </Box>
      )}

      {showLogin && <Login setJwtToken={handleLogin} />}
      {showRegister && <Register />}

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <TextField
          name="date"
          type="date"
          variant="outlined"
          margin="normal"
          fullWidth
          error={!!dateError}
          helperText={dateError}
        />
        <FormControlLabel
          control={
            <Checkbox
              name="onlyNotBooked"
              checked={onlyNotBooked}
              onChange={() => setOnlyNotBooked(!onlyNotBooked)}
            />
          }
          label="Only Show Not Booked"
        />
        <TextField name="maxPrice" label="Max Price" type="number" variant="outlined" margin="normal" fullWidth />
        <Select name="sortByPrice" defaultValue="ByPrice" fullWidth variant="outlined" margin="normal">
          <MenuItem value="ByPrice">Sort by Price</MenuItem>
          <MenuItem value="ByTransfersCount">Sort by Transfers</MenuItem>
        </Select>
        <TextField name="airlineName" label="Airline Name" variant="outlined" margin="normal" fullWidth />
        <Button type="submit" variant="contained" color="primary" fullWidth>Search Tickets</Button>
      </form>

      {error && <Alert severity="error">{error}</Alert>}
      {successMessage && <Snackbar
        open={true}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
      />}

      <Grid container spacing={2}>
        {tickets.map(ticket => (
          <Grid item xs={12} sm={6} md={4} key={ticket.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  From {ticket.arrivalPoint.cityName} to {ticket.departurePoint.cityName}
                </Typography>
                <Typography color="textSecondary">{ticket.airline.name}</Typography>
                <Typography>Price: {ticket.price}</Typography>
                <Typography>{ticket.isBooked ? "Забронирован" : "Не забронирован"}</Typography>
              </CardContent>
              <CardActions>
                {isAuthenticated && (
                  <Button
                    onClick={() => bookTicket(ticket.originalId, ticket.sourse)}
                    disabled={ticket.isBooked}
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    Book
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default App;