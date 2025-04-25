import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Box, Paper, IconButton, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import './WorkoutsPage.css';

const WorkoutsPage = () => {
  // Carrega os workouts salvos do localStorage ao inicializar
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
  const [isLoading, setIsLoading] = useState(true);

  const days = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
    'Domingo'
  ];

  // Função para salvar workouts no localStorage
  const saveWorkoutsToLocalStorage = (workoutsData) => {
    try {
      localStorage.setItem('workouts', JSON.stringify(workoutsData));
    } catch (error) {
      console.error('Erro ao salvar workouts no localStorage:', error);
    }
  };

  // Atualiza o localStorage sempre que workouts mudar
  useEffect(() => {
    saveWorkoutsToLocalStorage(workouts);
  }, [workouts]);

  // Busca exercícios da API
  useEffect(() => {
    const fetchExercises = async () => {
      try {
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
        console.error("Erro ao buscar exercícios:", error);
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, []);

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
          name: primaryTranslation.name,
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
      id: Date.now() // Adiciona um ID único baseado no timestamp
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
          />
          
          <FormControl fullWidth margin="normal">
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
          
          <Typography variant="h6" component="h3" gutterBottom>
            Adicionar Exercícios
          </Typography>
          
          <Box className="exercise-selection">
            <FormControl fullWidth margin="normal">
              <InputLabel>Selecione um Exercício</InputLabel>
              <Select
                value={selectedExercise || ''}
                onChange={(e) => setSelectedExercise(e.target.value)}
                label="Selecione um Exercício"
                disabled={isLoading}
              >
                {allExercises.map(exercise => {
                  const primaryTranslation = exercise.translations[0] || 
                                           exercise.translations.find(t => t.language === 'pt-BR') || 
                                           exercise.translations[0];
                  return (
                    <MenuItem key={exercise.id} value={exercise.id}>
                      {primaryTranslation?.name || exercise.name} ({exercise.category.name})
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            
            <Box className="sets-reps-inputs" sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                label="Séries"
                type="number"
                value={sets}
                onChange={(e) => setSets(Math.max(1, e.target.value))}
                fullWidth
              />
              
              <TextField
                label="Repetições"
                type="number"
                value={reps}
                onChange={(e) => setReps(Math.max(1, e.target.value))}
                inputProps={{ min: 1 }}
                fullWidth
              />
              
              <Button
                variant="contained"
                color="primary"
                onClick={addExerciseToWorkout}
                startIcon={<AddIcon />}
                disabled={!selectedExercise}
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
              
              <Paper elevation={2} sx={{ p: 2 }}>
                {newWorkout.exercises.map((exercise, index) => (
                  <Box key={index} className="exercise-item" sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                    p: 1,
                    backgroundColor: 'action.hover',
                    borderRadius: 1
                  }}>
                    <Box>
                      <Typography fontWeight="bold">{exercise.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {exercise.sets} séries × {exercise.reps} repetições
                      </Typography>
                    </Box>
                    
                    <IconButton 
                      onClick={() => removeExerciseFromWorkout(index)}
                      color="error"
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
              >
                Salvar Treino
              </Button>
            </Box>
          )}
        </Box>
      </Box>
      
      <Box className="saved-workouts-section" sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Treinos Salvos
        </Typography>
        
        {workouts.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            Nenhum treino salvo ainda. Crie seu primeiro treino acima.
          </Typography>
        ) : (
          <Box className="workout-list">
            {workouts.map((workout, index) => (
              <Paper key={workout.id || index} elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" component="h3">
                    {workout.name} ({workout.day})
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => deleteWorkout(index)}
                    size="small"
                  >
                    Excluir
                  </Button>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Exercícios:
                  </Typography>
                  
                  <Box component="ul" sx={{ pl: 2 }}>
                    {workout.exercises.map((exercise, exIndex) => (
                      <Box key={exIndex} component="li" sx={{ mb: 1 }}>
                        <Typography>
                          {exercise.name} - {exercise.sets} séries × {exercise.reps} repetições
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