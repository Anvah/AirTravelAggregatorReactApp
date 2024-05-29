import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Alert, Container, Typography } from '@mui/material';

function Login({ setJwtToken }) {
  const [error, setError] = useState(null);

  const handleLogin = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const password = formData.get('password');
    try {
      const response = await axios.post('http://localhost:5200/api/Auth/authenticate', { username, password });
      setJwtToken(response.data.token);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>Login</Typography>
      <form onSubmit={handleLogin}>
        <TextField name="username" label="Имя пользователя" variant="outlined" margin="normal" fullWidth />
        <TextField name="password" label="Пароль" type="password" variant="outlined" margin="normal" fullWidth />
        <Button type="submit" variant="contained" color="primary" fullWidth>Войти</Button>
      </form>
      {error && <Alert severity="error">{error}</Alert>}
    </Container>
  );
}

export default Login;
