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

  const fetchTickets = async (date, onlyNotBooked, maxPrice, sortProperty, airlineName) => {
    try {
      const response = await axios.get('http://localhost:5115/fligts/get', {
        params: {
          date,
          onlyNotBooked,
          sortProperty,
          maxPrice,
          airlineName
        }
      });
      setTickets(response.data.result);
      setError(null);
    } catch (error) {
      setError("Билеты по вашему запросу не найдены");
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
      const updatedTickets = tickets.map(ticket => {
        if (ticket.originalId === ticketId) {
          return { ...ticket, isBooked: true };
        }
        return ticket;
      });
      setTickets(updatedTickets);
      setSuccessMessage('Билет успешно забронирован!');
    } catch (error) {
      setError("При бронировании возникла ошибка");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const date = formData.get('date');
    const maxPrice = formData.get('maxPrice');
    const sortProperty = formData.get('sortProperty');
    const airlineName = formData.get('airlineName');

    if (!date) {
      setDateError('Date is required');
      return;
    } else {
      setDateError('');
    }

    fetchTickets(date, onlyNotBooked, maxPrice, sortProperty, airlineName);
  };

  const handleLogin = (token) => {
    setJwtToken(token);
    setIsAuthenticated(true);
    setShowLogin(false);
    setShowRegister(false);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Агрегатор авиабилетов</Typography>
      {!isAuthenticated && (
        <Box display="flex" mb={2}>
          <Button onClick={() => { setShowLogin(true); setShowRegister(false); }} variant="contained" color="primary" style={{ marginRight: '10px' }}>Войти</Button>
          <Button onClick={() => { setShowRegister(true); setShowLogin(false); }} variant="contained" color="secondary">Зарегистрироваться</Button>
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
          label="Показывать только свободные билеты"
        />
        <TextField name="maxPrice" label="Максимальная цена" type="number" variant="outlined" margin="normal" fullWidth />
        <Select name="sortProperty" defaultValue="ByPrice" fullWidth variant="outlined" margin="normal">
          <MenuItem value="ByPrice">Сортировать по цене</MenuItem>
          <MenuItem value="ByTransfersCount">Сортировать по количеству пересадок</MenuItem>
        </Select>
        <TextField name="airlineName" label="Название авиакомпании" variant="outlined" margin="normal" fullWidth />
        <Button type="submit" variant="contained" color="primary" fullWidth>Найти билеты</Button>
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
                  Из {ticket.arrivalPoint.airportName} в {ticket.departurePoint.airportName}
                </Typography>
                <Typography color="textSecondary">{ticket.airline.name}</Typography>
                <Typography>Цена: {ticket.price}</Typography>
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

