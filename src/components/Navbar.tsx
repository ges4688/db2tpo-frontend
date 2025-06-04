import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogActions,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, logoutWithSessionDelete } = useAuth();
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  const handleLogout = () => {
    setOpenLogoutDialog(true);
  };

  const handleLogoutYes = () => {
    setOpenLogoutDialog(false);
    logout();
    navigate('/login');
  };

  const handleLogoutNo = async () => {
    setOpenLogoutDialog(false);
    await logoutWithSessionDelete();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Recetas App
        </Typography>
        <Box>
          {isAuthenticated ? (
            <>
              <Button color="inherit" onClick={() => navigate('/home')}>
                Inicio
              </Button>
              <Button color="inherit" onClick={() => navigate('/recipe/create')}>
                Nueva Receta
              </Button>
              <Button color="inherit" onClick={() => navigate('/favoritos')}>
                Favoritos
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Iniciar Sesión
              </Button>
              <Button color="inherit" onClick={() => navigate('/register')}>
                Registrarse
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
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
    </AppBar>
  );
} 