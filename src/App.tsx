import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import RecipeCreate from './pages/RecipeCreate';
import RecipeEdit from './pages/RecipeEdit';
import Favoritos from './pages/Favoritos';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/recipe/create" element={<RecipeCreate />} />
            <Route path="/recipe/edit/:id" element={<RecipeEdit />} />
            <Route path="/favoritos" element={<Favoritos />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </Box>
      </Box>
    </AuthProvider>
  );
}

export default App; 