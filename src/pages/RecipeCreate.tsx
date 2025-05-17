import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import axios from 'axios';

export default function RecipeCreate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState('');
  const [sessionError, setSessionError] = useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setSessionError(true);
    }
  }, []);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const filteredIngredients = ingredients.filter(ing => ing.trim() !== '');
      
      await axios.post(
        'http://localhost:3001/api/recipes',
        {
          title,
          ingredients: filteredIngredients,
          instructions,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      navigate('/home');
    } catch (err) {
      setError('Error al crear la receta. Por favor, intenta nuevamente.');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Crear Nueva Receta
          </Typography>
          {sessionError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              La sesión debe estar iniciada para crear una receta
            </Alert>
          )}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Título de la Receta"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              required
              disabled={sessionError}
            />
            
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Ingredientes
            </Typography>
            {ingredients.map((ingredient, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  label={`Ingrediente ${index + 1}`}
                  value={ingredient}
                  onChange={(e) => handleIngredientChange(index, e.target.value)}
                  margin="normal"
                  disabled={sessionError}
                />
                {ingredients.length > 1 && (
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveIngredient(index)}
                    sx={{ mt: 2 }}
                    disabled={sessionError}
                  >
                    <RemoveIcon />
                  </IconButton>
                )}
                {index === ingredients.length - 1 && (
                  <IconButton
                    color="primary"
                    onClick={handleAddIngredient}
                    sx={{ mt: 2 }}
                    disabled={sessionError}
                  >
                    <AddIcon />
                  </IconButton>
                )}
              </Box>
            ))}

            <TextField
              fullWidth
              label="Instrucciones"
              multiline
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              margin="normal"
              required
              disabled={sessionError}
            />

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={sessionError}
              >
                Crear Receta
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/home')}
              >
                Cancelar
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}