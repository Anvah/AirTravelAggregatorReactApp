import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Alert, Container, Typography } from '@mui/material';

function Register() {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleRegister = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const password = formData.get('password');
    try {
      const response = await axios.post('http://localhost:5200/api/Auth/createAccount', { username, password });
      setSuccess('Registration successful!');
      setError(null);
    } catch (error) {
      setError(error.message);
      setSuccess(null);
    }
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>Регистрация</Typography>
      <form onSubmit={handleRegister}>
        <TextField name="username" label="Имя пользователя" variant="outlined" margin="normal" fullWidth />
        <TextField name="password" label="Проль" type="password" variant="outlined" margin="normal" fullWidth />
        <Button type="submit" variant="contained" color="primary" fullWidth>Создать аккаунт</Button>
      </form>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
    </Container>
  );
}

export default Register;
