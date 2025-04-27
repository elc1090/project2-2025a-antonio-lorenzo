import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, Typography, Button, TextField, Select, MenuItem, 
  FormControl, InputLabel, Box, Paper, IconButton, Divider, 
  Chip, CircularProgress 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import './WorkoutsPage.css';

const API_BASE_URL = 'https://wger.de/api/v2';
const PAGE_SIZE = 20;

const WorkoutsPage = () => {
  // Estados principais
  const [workouts, setWorkouts] = useState(() => {
    const savedWorkouts = localStorage.getItem('workouts');
    return savedWorkouts ? JSON.parse(savedWorkouts) : [];
  });

  const [newWorkout, setNewWorkout] = useState({
    name: '',
    day: '',
    exercises: []
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedExercise, setSelectedExercise] = useState(null);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [allExercises, setAllExercises] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectLoading, setSelectLoading] = useState(false);

  const selectRef = useRef(null);
  const days = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

  // Carrega exercícios com paginação
  const fetchExercises = useCallback(async (currentOffset = 0) => {
    setSelectLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/exerciseinfo/?limit=${PAGE_SIZE}&offset=${currentOffset}`
      );
      const data = await response.json();
      
      setAllExercises(prev => {
        const newExercises = data.results.filter(newEx => 
          !prev.some(ex => ex.id === newEx.id)
        );
        return [...prev, ...newExercises];
      });

      setHasMore(data.results.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setSelectLoading(false);
      setIsLoading(false);
    }
  }, []);

  // Carrega categorias
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/exercisecategory/`);
      const data = await response.json();
      setCategories(data.results);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  // Scroll infinito dentro do Select
  const handleSelectScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isNearBottom = scrollHeight - scrollTop <= clientHeight + 50;
    
    if (isNearBottom && !selectLoading && hasMore) {
      setOffset(prev => prev + PAGE_SIZE);
    }
  };

  // Carrega mais exercícios quando offset muda
  useEffect(() => {
    if (offset > 0) {
      fetchExercises(offset);
    }
  }, [offset, fetchExercises]);

  // Carrega dados iniciais
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      await fetchCategories();
      await fetchExercises(0);
    };

    fetchInitialData();
  }, [fetchCategories, fetchExercises]);

  // Salva workouts no localStorage
  useEffect(() => {
    localStorage.setItem('workouts', JSON.stringify(workouts));
  }, [workouts]);

  // Filtra exercícios por categoria
  const filteredExercises = selectedCategory === 'all' 
    ? allExercises 
    : allExercises.filter(ex => ex.category.id === Number(selectedCategory));

  // Manipuladores de eventos
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
          category: exercise.category.name,
          categoryId: exercise.category.id
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
              <Select
                ref={selectRef}
                value={selectedExercise || ''}
                onChange={(e) => setSelectedExercise(e.target.value)}
                label="Selecione um Exercício"
                MenuProps={{
                  PaperProps: {
                    onScroll: handleSelectScroll,
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                {filteredExercises.map(exercise => {
                  const primaryTranslation = exercise.translations?.find(t => t.language === 'pt-BR') || 
                                           exercise.translations?.[0] || 
                                           { name: exercise.name };
                  return (
                    <MenuItem key={exercise.id} value={exercise.id}>
                      {primaryTranslation.name} ({exercise.category.name})
                    </MenuItem>
                  );
                })}
                {selectLoading && (
                  <MenuItem disabled>
                    <Box display="flex" justifyContent="center" width="100%">
                      <CircularProgress size={24} />
                    </Box>
                  </MenuItem>
                )}
                {!hasMore && allExercises.length > 0 && (
                  <MenuItem disabled>
                    <Box display="flex" justifyContent="center" width="100%">
                      Todos os exercícios carregados
                    </Box>
                  </MenuItem>
                )}
              </Select>
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
                      <Link 
                        to={{
                          pathname: "/exercises",
                          search: `?exerciseId=${exercise.id}`,
                          state: { 
                            searchTerm: exercise.name,
                            fromWorkout: true 
                          }
                        }}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        {exercise.name}
                      </Link>
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
                        <Link 
                          to={{
                            pathname: "/exercises",
                            search: `?exerciseId=${exercise.id}`,
                            state: { 
                              searchTerm: exercise.name,
                              fromWorkout: true 
                            }
                          }}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          {exercise.name}
                        </Link>
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