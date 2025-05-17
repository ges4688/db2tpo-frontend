import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  TextField,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Slider from 'react-slick';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface Recipe {
  _id: string;
  title: string;
  ingredients: string[];
  instructions: string;
  ownerId: string;
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch recent recipes
        const recentResponse = await axios.get('http://localhost:3001/api/recent-recipes', { headers });
        setRecentRecipes(recentResponse.data.data);

        // Fetch all recipes
        const allResponse = await axios.get('http://localhost:3001/api/recipes', { headers });
        setAllRecipes(allResponse.data.data);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };

    fetchRecipes();
  }, []);

  const handleDelete = async (recipeId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/recipes/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllRecipes(allRecipes.filter(recipe => recipe._id !== recipeId));
      setRecentRecipes(recentRecipes.filter(recipe => recipe._id !== recipeId));
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const filteredRecipes = allRecipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      {/* Recent Recipes Carousel */}
      {recentRecipes.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom>
            Recetas Recientes
          </Typography>
          <Slider {...sliderSettings}>
            {recentRecipes.map((recipe) => (
              <div key={recipe._id}>
                <Card sx={{ m: 1 }}>
                  <CardContent>
                    <Typography variant="h5">{recipe.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ingredientes: {recipe.ingredients.join(', ')}
                    </Typography>
                  </CardContent>
                </Card>
              </div>
            ))}
          </Slider>
        </Box>
      )}

      {/* Search Bar */}
      <TextField
        fullWidth
        label="Buscar recetas"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 4 }}
      />

      {/* All Recipes Grid */}
      <Typography variant="h4" gutterBottom>
        Todas las Recetas
      </Typography>
      <Grid container spacing={3}>
        {filteredRecipes.map((recipe) => (
          <Grid item xs={12} sm={6} md={4} key={recipe._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{recipe.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Ingredientes: {recipe.ingredients.join(', ')}
                </Typography>
              </CardContent>
              {recipe.ownerId === user?.id && (
                <CardActions>
                  <IconButton
                    onClick={() => navigate(`/recipe/edit/${recipe._id}`)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(recipe._id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Recipe Button */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/recipe/create')}
        >
          Crear Nueva Receta
        </Button>
      </Box>
    </Container>
  );
} 