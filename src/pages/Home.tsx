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
import { Edit as EditIcon, Delete as DeleteIcon, Favorite, FavoriteBorder } from '@mui/icons-material';
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
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);

  // Cargar recetas recientes desde Redis al iniciar
  useEffect(() => {
    const fetchRecent = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get('http://localhost:3001/api/recent-recipes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.returnCode === 'SUCCESS') setRecentRecipes(res.data.data);
      } catch (err) {
        // Manejar error
      }
    };
    if (user) fetchRecent();
  }, [user]);

  // Cargar todas las recetas o buscar
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

  // Cargar favoritos al iniciar
  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get('http://localhost:3001/api/favorite-recipes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.returnCode === 'SUCCESS') setFavoriteRecipes(res.data.data);
      } catch (err) {}
    };
    if (user) fetchFavorites();
  }, [user]);

  // Handler para abrir receta de comunidad (fetch por ID y actualiza recientes en Redis)
  const handleOpenRecipeFromCommunity = async (recipeId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get(`http://localhost:3001/api/recipes/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.returnCode === 'SUCCESS') {
        setOpenRecipe(res.data.data);
        // Actualizar recientes desde Redis
        const recentRes = await axios.get('http://localhost:3001/api/recent-recipes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (recentRes.data.returnCode === 'SUCCESS') setRecentRecipes(recentRes.data.data);
      }
    } catch (err) {
      // Manejar error
    }
  };

  // Handler para abrir receta de recientes (sin fetch extra)
  const handleOpenRecipeFromRecent = (recipe: Recipe) => {
    setOpenRecipe(recipe);
  };

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

  const handleToggleFavorite = async (recipeId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.post('http://localhost:3001/api/favorite-recipes', { recipeId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.returnCode === 'SUCCESS') setFavoriteRecipes(res.data.data);
    } catch (err) {}
  };

  const isFavorite = (id: string) => favoriteRecipes.some(r => r._id === id);

  const filteredRecipes = allRecipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <IconButton onClick={() => handleToggleFavorite(recipe._id)}>
                      {isFavorite(recipe._id) ? (
                        <Favorite sx={{ color: 'red' }} />
                      ) : (
                        <FavoriteBorder />
                      )}
                    </IconButton>
                    <Button
                      size="small"
                      onClick={() => handleOpenRecipeFromRecent(recipe)}
                    >
                      Ver más
                    </Button>
                    {recipe.ownerId === user?.id && (
                      <>
                        <IconButton onClick={() => navigate(`/recipe/edit/${recipe._id}`)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(recipe._id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
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
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <IconButton onClick={() => handleToggleFavorite(recipe._id)}>
                  {isFavorite(recipe._id) ? (
                    <Favorite sx={{ color: 'red' }} />
                  ) : (
                    <FavoriteBorder />
                  )}
                </IconButton>
                <Button
                  size="small"
                  onClick={() => handleOpenRecipeFromCommunity(recipe._id)}
                >
                  Ver más
                </Button>
                {recipe.ownerId === user?.id && (
                  <>
                    <IconButton onClick={() => navigate(`/recipe/edit/${recipe._id}`)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(recipe._id)} color="error">
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