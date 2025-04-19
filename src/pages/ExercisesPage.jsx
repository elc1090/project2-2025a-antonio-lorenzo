import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ExerciseCard from '../components/ExerciseCard';
import './ExercisePage.css';

const ExercisePage = () => {
  const [allExercises, setAllExercises] = useState([]);
  const [categories, setCategories] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [muscles, setMuscles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedExerciseId, setExpandedExerciseId] = useState(null);
  const [videos, setVideos] = useState([]);
  const [muscleImages, setMuscleImages] = useState({});

  // Fetch all exercises with pagination
  const fetchAllExercises = async () => {
    let allResults = [];
    let nextUrl = 'https://wger.de/api/v2/exerciseinfo/';
    
    try {
      setIsLoading(true);
      while (nextUrl) {
        const response = await fetch(nextUrl);
        const data = await response.json();
        allResults = [...allResults, ...data.results];
        nextUrl = data.next;
      }
      setAllExercises(allResults);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    }
  };

  // Fetch exercise videos
  const fetchVideos = async () => {
    try {
      const response = await fetch('https://wger.de/api/v2/video/');
      const data = await response.json();
      setVideos(data.results);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  // Fetch muscle images
  const fetchMuscleImages = async () => {
    try {
      const response = await fetch('https://wger.de/api/v2/muscle/');
      const data = await response.json();
      
      const imagesMap = {};
      data.results.forEach(muscle => {
        imagesMap[muscle.id] = {
          name: muscle.name,
          is_front: muscle.is_front,
          main: `https://wger.de${muscle.image_url_main}`,
          secondary: `https://wger.de${muscle.image_url_secondary}`
        };
      });
      
      setMuscleImages(imagesMap);
    } catch (error) {
      console.error("Error fetching muscle images:", error);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([
        fetchAllExercises(),
        fetchVideos(),
        fetchMuscleImages(),
        fetch('https://wger.de/api/v2/exercisecategory/').then(res => res.json()),
        fetch('https://wger.de/api/v2/equipment/').then(res => res.json()),
        fetch('https://wger.de/api/v2/muscle/').then(res => res.json())
      ]).then(([_, __, ___, categoriesData, equipmentData, musclesData]) => {
        setCategories(categoriesData.results);
        setEquipment(equipmentData.results);
        setMuscles(musclesData.results);
        setIsLoading(false);
      });
    };

    fetchInitialData();
  }, []);

  const toggleExercise = (exerciseId) => {
    setExpandedExerciseId(expandedExerciseId === exerciseId ? null : exerciseId);
  };

  const getExerciseVideos = (exerciseId) => {
    return videos.filter(video => video.exercise === exerciseId);
  };

  const filteredExercises = allExercises.filter(exercise => {
    if (selectedCategory && exercise.category.id !== selectedCategory) return false;
    if (selectedEquipment && !exercise.equipment.some(e => e.id === selectedEquipment)) return false;
    if (selectedMuscle && 
        !exercise.muscles.some(m => m.id === selectedMuscle) && 
        !exercise.muscles_secondary.some(m => m.id === selectedMuscle)) return false;
    if (searchTerm && 
        !exercise.translations[0]?.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedEquipment(null);
    setSelectedMuscle(null);
    setSearchTerm('');
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading exercises...</div>
      </div>
    );
  }

  return (
    <div className="exercise-app">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/">Fitness App</Link>
        </div>
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/exercises" className="nav-link active">Exercises</Link>
          <Link to="/workouts" className="nav-link">Workouts</Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="exercise-page">
        <div className="filters-section">
          <h2>Filter Exercises</h2>
          
          <div className="search-box">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <h3>Categories</h3>
            <div className="filter-options">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={selectedCategory === category.id ? 'active' : ''}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="filter-group">
            <h3>Equipment</h3>
            <div className="filter-options">
              {equipment.map(item => (
                <button
                  key={item.id}
                  className={selectedEquipment === item.id ? 'active' : ''}
                  onClick={() => setSelectedEquipment(selectedEquipment === item.id ? null : item.id)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="filter-group">
            <h3>Muscles</h3>
            <div className="filter-options">
              {muscles.map(muscle => (
                <button
                  key={muscle.id}
                  className={selectedMuscle === muscle.id ? 'active' : ''}
                  onClick={() => setSelectedMuscle(selectedMuscle === muscle.id ? null : muscle.id)}
                >
                  {muscle.name}
                </button>
              ))}
            </div>
          </div>
          
          <button className="reset-filters" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
        
        <div className="exercises-section">
          <h2>Exercises ({filteredExercises.length})</h2>
          
          {filteredExercises.length === 0 ? (
            <div className="no-results">
              No exercises found with selected filters.
            </div>
          ) : (
            <div className="exercises-list">
              {filteredExercises.map(exercise => (
                <ExerciseCard 
                  key={exercise.id}
                  exercise={exercise}
                  isExpanded={expandedExerciseId === exercise.id}
                  onToggle={() => toggleExercise(exercise.id)}
                  videos={getExerciseVideos(exercise.id)}
                  muscleImages={muscleImages}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExercisePage;