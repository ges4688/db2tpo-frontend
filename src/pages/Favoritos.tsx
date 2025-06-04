import React, { useEffect, useState } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Favorite, FavoriteBorder, Edit, Delete } from '@mui/icons-material';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import Chip from '@mui/material/Chip';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Recipe {
  _id: string;
  title: string;
  ingredients: string[];
  instructions: string;
  ownerId: string;
}

export default function Favoritos() {
  const { user, logout, logoutWithSessionDelete } = useAuth();
  const navigate = useNavigate();
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get('http://localhost:3001/api/favorite-recipes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.returnCode === 'SUCCESS') setFavoriteRecipes(res.data.data);
      } catch (err) {
        // Manejar error
      }
    };
    if (user) fetchFavorites();
  }, [user]);

  const handleToggleFavorite = async (recipeId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.post('http://localhost:3001/api/favorite-recipes', { recipeId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.returnCode === 'SUCCESS') setFavoriteRecipes(res.data.data);
    } catch (err) {
      // Manejar error
    }
  };

  const isFavorite = (id: string) => favoriteRecipes.some(r => r._id === id);

  const handleLogout = () => {
    setOpenLogoutDialog(true);
  };

  const handleLogoutYes = () => {
    setOpenLogoutDialog(false);
    logout();
  };

  const handleLogoutNo = async () => {
    setOpenLogoutDialog(false);
    await logoutWithSessionDelete();
    navigate('/login');
  };

  const handleDelete = async (recipeId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/recipes/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavoriteRecipes(favoriteRecipes.filter(recipe => recipe._id !== recipeId));
    } catch (error) {
      // Manejar error
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Recetas Favoritas
      </Typography>
      <Grid container spacing={3}>
        {favoriteRecipes.map((recipe) => (
          <Grid item xs={12} sm={6} md={4} key={recipe._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">{recipe.title}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                  onClick={() => setOpenRecipe(recipe)}
                >
                  Ver más
                </Button>
                {recipe.ownerId === user?.id && (
                  <>
                    <IconButton onClick={() => navigate(`/recipe/edit/${recipe._id}`)} color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(recipe._id)} color="error">
                      <Delete />
                    </IconButton>
                  </>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
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
      <Dialog open={openLogoutDialog} onClose={() => setOpenLogoutDialog(false)}>
        <DialogTitle>¿Desea guardar sus recetas favoritas?</DialogTitle>
        <DialogActions>
          <Button onClick={handleLogoutYes} color="primary">
            Sí
          </Button>
          <Button onClick={handleLogoutNo} color="error">
            No
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 