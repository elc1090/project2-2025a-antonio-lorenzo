import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Box, Paper, IconButton, Divider, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import './WorkoutsPage.css';
import { CircularProgress } from '@mui/material';

const WorkoutsPage = () => {
  const [workouts, setWorkouts] = useState(() => {
    const savedWorkouts = localStorage.getItem('workouts');
    return savedWorkouts ? JSON.parse(savedWorkouts) : [];
  });

  const [newWorkout, setNewWorkout] = useState({
    name: '',
    day: '',
    exercises: []
  });

  const [selectedExercise, setSelectedExercise] = useState(null);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [allExercises, setAllExercises] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const days = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
    'Domingo'
  ];

  const saveWorkoutsToLocalStorage = (workoutsData) => {
    try {
      localStorage.setItem('workouts', JSON.stringify(workoutsData));
    } catch (error) {
      console.error('Erro ao salvar workouts no localStorage:', error);
    }
  };

  useEffect(() => {
    saveWorkoutsToLocalStorage(workouts);
  }, [workouts]);

  useEffect(() => {
    const fetchExercisesAndCategories = async () => {
      try {
        // Buscar categorias primeiro
        const categoriesResponse = await fetch('https://wger.de/api/v2/exercisecategory/');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.results);

        // Buscar exercícios
        let allResults = [];
        let nextUrl = 'https://wger.de/api/v2/exerciseinfo/';
        
        while (nextUrl) {
          const response = await fetch(nextUrl);
          const data = await response.json();
          allResults = [...allResults, ...data.results];
          nextUrl = data.next;
        }
        
        setAllExercises(allResults);
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setIsLoading(false);
      }
    };

    fetchExercisesAndCategories();
  }, []);

  const filteredExercises = selectedCategory === 'all' 
    ? allExercises 
    : allExercises.filter(ex => ex.category.id === Number(selectedCategory));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewWorkout(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addExerciseToWorkout = () => {
    if (!selectedExercise) return;
    
    const exercise = allExercises.find(ex => ex.id === selectedExercise);
    if (!exercise) return;
    
    const primaryTranslation = exercise.translations[0] || 
                             exercise.translations.find(t => t.language === 'pt-BR') || 
                             exercise.translations[0];
    
    setNewWorkout(prev => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          id: exercise.id,
          name: primaryTranslation?.name || exercise.name,
          sets: Number(sets),
          reps: Number(reps),
          category: exercise.category.name
        }
      ]
    }));
    
    setSelectedExercise(null);
    setSets(3);
    setReps(10);
  };

  const removeExerciseFromWorkout = (index) => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const saveWorkout = () => {
    if (!newWorkout.name || !newWorkout.day || newWorkout.exercises.length === 0) {
      alert('Preencha todos os campos e adicione pelo menos um exercício');
      return;
    }
    
    const newWorkoutWithId = {
      ...newWorkout,
      id: Date.now()
    };
    
    setWorkouts(prev => [...prev, newWorkoutWithId]);
    setNewWorkout({
      name: '',
      day: '',
      exercises: []
    });
  };

  const deleteWorkout = (index) => {
    setWorkouts(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Container maxWidth="lg" className="workouts-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/">IronCore App</Link>
        </div>
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/exercises" className="nav-link">Exercícios</Link>
          <Link to="/workouts" className="nav-link active">Treinos</Link>
        </div>
      </nav>

      <Typography variant="h4" component="h1" gutterBottom className="page-title">
        Meus Treinos
      </Typography>

      <Box className="workout-creation-section">
        <Typography variant="h5" component="h2" gutterBottom>
          Criar Novo Treino
        </Typography>
        
        <Box className="workout-form">
          <TextField
            label="Nome do Treino"
            name="name"
            value={newWorkout.name}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            className="workout-input"
          />
          
          <FormControl fullWidth margin="normal" className="workout-select">
            <InputLabel>Dia da Semana</InputLabel>
            <Select
              name="day"
              value={newWorkout.day}
              onChange={handleInputChange}
              label="Dia da Semana"
            >
              {days.map(day => (
                <MenuItem key={day} value={day}>{day}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="h3" gutterBottom>
              Adicionar Exercícios
            </Typography>
            
            <Button 
              variant="outlined" 
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              className="filter-button"
            >
              Filtros
            </Button>
          </Box>
          
          {showFilters && (
            <Box className="category-filters" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Filtrar por grupamento muscular:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  label="Todos"
                  onClick={() => setSelectedCategory('all')}
                  color={selectedCategory === 'all' ? 'primary' : 'default'}
                  className="category-chip"
                />
                {categories.map(category => (
                  <Chip
                    key={category.id}
                    label={category.name}
                    onClick={() => setSelectedCategory(category.id.toString())}
                    color={selectedCategory === category.id.toString() ? 'primary' : 'default'}
                    className="category-chip"
                  />
                ))}
              </Box>
            </Box>
          )}
          
          <Box className="exercise-selection">
        <FormControl fullWidth margin="normal" className="exercise-select">
          <InputLabel>Selecione um Exercício</InputLabel>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '56px' }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Select
              value={selectedExercise || ''}
              onChange={(e) => setSelectedExercise(e.target.value)}
              label="Selecione um Exercício"
              disabled={isLoading}
            >
              {filteredExercises.length === 0 ? (
                <MenuItem disabled>Nenhum exercício disponível</MenuItem>
              ) : (
                filteredExercises.map(exercise => {
                  const primaryTranslation = exercise.translations?.find(t => t.language === 'pt-BR') || 
                                             exercise.translations?.[0] || 
                                             { name: exercise.name };
                  return (
                    <MenuItem key={exercise.id} value={exercise.id}>
                      {primaryTranslation.name} ({exercise.category.name})
                    </MenuItem>
                  );
                })
              )}
            </Select>
          )}
        </FormControl>
        
            
            <Box className="sets-reps-inputs" sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                label="Séries"
                type="number"
                value={sets}
                onChange={(e) => setSets(Math.max(1, e.target.value))}
                fullWidth
                className="sets-input"
              />
              
              <TextField
                label="Repetições"
                type="number"
                value={reps}
                onChange={(e) => setReps(Math.max(1, e.target.value))}
                inputProps={{ min: 1 }}
                fullWidth
                className="reps-input"
              />
              
              <Button
                variant="contained"
                color="primary"
                onClick={addExerciseToWorkout}
                startIcon={<AddIcon />}
                disabled={!selectedExercise}
                className="add-exercise-button"
              >
                Add
              </Button>
            </Box>
          </Box>
          
          {newWorkout.exercises.length > 0 && (
            <Box className="added-exercises" sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Exercícios neste treino:
              </Typography>
              
              <Paper elevation={2} sx={{ p: 2 }} className="exercises-paper">
                {newWorkout.exercises.map((exercise, index) => (
                  <Box key={index} className="exercise-item">
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography fontWeight="bold" className="exercise-name">
                        {exercise.name}
                        <Chip 
                          label={exercise.category} 
                          size="small" 
                          sx={{ ml: 1 }} 
                          className="exercise-category"
                        />
                      </Typography>
                      <Typography variant="body2" className="exercise-details">
                        {exercise.sets} séries × {exercise.reps} repetições
                      </Typography>
                    </Box>
                    
                    <IconButton 
                      onClick={() => removeExerciseFromWorkout(index)}
                      color="error"
                      className="delete-exercise-button"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Paper>
              
              <Button
                variant="contained"
                color="success"
                onClick={saveWorkout}
                fullWidth
                sx={{ mt: 2 }}
                disabled={!newWorkout.name || !newWorkout.day || newWorkout.exercises.length === 0}
                className="save-workout-button"
              >
                Salvar Treino
              </Button>
            </Box>
          )}
        </Box>
      </Box>
      
      <Box className="saved-workouts-section">
        <Typography variant="h5" component="h2" gutterBottom>
          Treinos Salvos
        </Typography>
        
        {workouts.length === 0 ? (
          <Typography variant="body1" color="text.secondary" className="no-workouts-message">
            Nenhum treino salvo ainda. Crie seu primeiro treino acima.
          </Typography>
        ) : (
          <Box className="workout-list">
            {workouts.map((workout, index) => (
              <Paper key={workout.id || index} elevation={3} className="workout-card">
                <Box className="workout-card-header">
                  <Typography variant="h6" component="h3" className="workout-name">
                    {workout.name} 
                    <Chip label={workout.day} size="small" sx={{ ml: 1 }} className="workout-day-chip" />
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => deleteWorkout(index)}
                    size="small"
                    className="delete-workout-button"
                  >
                    Excluir
                  </Button>
                </Box>
                
                <Box sx={{ mt: 2 }} className="workout-exercises">
                  <Typography variant="subtitle2" gutterBottom className="exercises-title">
                    Exercícios:
                  </Typography>
                  
                  <Box component="ul" className="exercises-list">
                    {workout.exercises.map((exercise, exIndex) => (
                      <Box key={exIndex} component="li" className="exercise-list-item">
                        <Typography className="exercise-list-name">
                          {exercise.name}
                          <Chip 
                            label={exercise.category} 
                            size="small" 
                            sx={{ ml: 1 }} 
                            className="exercise-list-category"
                          />
                        </Typography>
                        <Typography className="exercise-list-details">
                          {exercise.sets} séries × {exercise.reps} repetições
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default WorkoutsPage;