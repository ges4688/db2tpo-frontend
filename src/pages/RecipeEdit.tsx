import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

interface Recipe {
  _id: string;
  title: string;
  ingredients: string[];
  instructions: string;
  ownerId: string;
}

export default function RecipeEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3001/api/recipes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const recipe: Recipe = response.data.data;
        setTitle(recipe.title);
        setIngredients(recipe.ingredients);
        setInstructions(recipe.instructions);
      } catch (error) {
        setError('Error al cargar la receta.');
        console.error('Error fetching recipe:', error);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id]);

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
      
      await axios.put(
        `http://localhost:3001/api/recipes/${id}`,
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
      setError('Error al actualizar la receta. Por favor, intenta nuevamente.');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Editar Receta
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Título de la Receta"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              required
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
                />
                {ingredients.length > 1 && (
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveIngredient(index)}
                    sx={{ mt: 2 }}
                  >
                    <RemoveIcon />
                  </IconButton>
                )}
                {index === ingredients.length - 1 && (
                  <IconButton
                    color="primary"
                    onClick={handleAddIngredient}
                    sx={{ mt: 2 }}
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
            />

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
              >
                Guardar Cambios
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