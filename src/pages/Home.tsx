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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import Chip from '@mui/material/Chip';

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

  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null);
  const [recentRecipeIds, setRecentRecipeIds] = useState<string[]>([]);

  // Cargar recetas vistas desde localStorage al iniciar
  useEffect(() => {
    const stored = localStorage.getItem('recentRecipeIds');
    if (stored) setRecentRecipeIds(JSON.parse(stored));
  }, []);

  // Guardar recetas vistas en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem('recentRecipeIds', JSON.stringify(recentRecipeIds));
  }, [recentRecipeIds]);

  useEffect(() => {
    if (!user) return;
    const fetchRecipes = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const allResponse = await axios.get('http://localhost:3001/api/recipes', { headers });
        setAllRecipes(allResponse.data.data);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };
    fetchRecipes();
  }, [user]);

  // Cuando se hace click en "Ver más", agregar la receta a recientes
  const handleOpenRecipe = (recipe: Recipe) => {
    setOpenRecipe(recipe);
    setRecentRecipeIds((prev) => {
      // Evitar duplicados y poner la receta al principio
      const filtered = prev.filter(id => id !== recipe._id);
      return [recipe._id, ...filtered].slice(0, 10); // Máximo 10 recientes
    });
  };

  const handleDelete = async (recipeId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/recipes/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllRecipes(allRecipes.filter(recipe => recipe._id !== recipeId));
      setRecentRecipeIds(recentRecipeIds.filter(id => id !== recipeId));
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const filteredRecipes = allRecipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Solo mostrar las recetas vistas en el carrusel de recientes
  const recentRecipes = recentRecipeIds
    .map(id => allRecipes.find(r => r._id === id))
    .filter((r): r is Recipe => !!r);

  // Renderizado condicional
  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h3" gutterBottom>
            Bienvenido a la comunidad de recetas
          </Typography>
          <Typography variant="h6" gutterBottom>
            Esta es una página para buscar y compartir recetas de comida entre usuarios.
            <br />
            Para comenzar, por favor inicia sesión o regístrate.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/login')}
            >
              Iniciar Sesión
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/register')}
            >
              Registrarse
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

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
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h6">{recipe.title}</Typography>
                      {recipe.ownerId === user?.id ? (
                        <Chip
                          icon={<PersonIcon />}
                          label="Tu receta"
                          color="primary"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      ) : (
                        <Chip
                          icon={<GroupIcon />}
                          label="Comunidad"
                          color="default"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Ingredientes: {recipe.ingredients.join(', ')}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => handleOpenRecipe(recipe)}
                    >
                      Ver más
                    </Button>
                  </CardActions>
                </Card>
              </div>
            ))}
          </Slider>
        </Box>
      )}

      {/* Popup para ver detalles de la receta */}
      <Dialog open={!!openRecipe} onClose={() => setOpenRecipe(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalle de la Receta</DialogTitle>
        <DialogContent dividers>
          {openRecipe && (
            <Box>
              <Typography variant="h6">{openRecipe.title}</Typography>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Ingredientes:</Typography>
              <ul>
                {openRecipe.ingredients.map((ing, idx) => (
                  <li key={idx}>{ing}</li>
                ))}
              </ul>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Instrucciones:</Typography>
              <Typography variant="body1">{openRecipe.instructions}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRecipe(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

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
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">{recipe.title}</Typography>
                  {recipe.ownerId === user?.id ? (
                    <Chip
                      icon={<PersonIcon />}
                      label="Tu receta"
                      color="primary"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  ) : (
                    <Chip
                      icon={<GroupIcon />}
                      label="Comunidad"
                      color="default"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Ingredientes: {recipe.ingredients.join(', ')}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => handleOpenRecipe(recipe)}
                >
                  Ver más
                </Button>
                {recipe.ownerId === user?.id && (
                  <>
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
                  </>
                )}
              </CardActions>
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