import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ExerciseCard from '../components/ExerciseCard';
import FavoriteExercises from '../components/FavoriteExercises';
import './ExercisePage.css';

// Configurações da API
const API_BASE_URL = 'https://wger.de/api/v2';
const PAGE_SIZE = 20; // Tamanho fixo da página da API

// Chaves para o localStorage
const CACHE_KEYS = {
  EXERCISES: 'exercisesCache',
  VIDEOS: 'videosCache',
  MUSCLES: 'musclesCache',
  CATEGORIES: 'categoriesCache',
  EQUIPMENT: 'equipmentCache'
};


const CACHE_EXPIRATION = 60 * 60 * 1000; // 1 hora

const ExercisePage = () => {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  // Estados
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
  const [showFavorites, setShowFavorites] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  // Funções de cache
  const isCacheValid = (key) => {
    const cachedData = localStorage.getItem(key);
    if (!cachedData) return false;
    const { timestamp } = JSON.parse(cachedData);
    return Date.now() - timestamp < CACHE_EXPIRATION;
  };

  const getFromCache = (key) => {
    const cachedData = localStorage.getItem(key);
    return cachedData ? JSON.parse(cachedData).data : null;
  };

  const saveToCache = (key, data) => {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  };

  // Busca exercícios com paginação correta
  const fetchExercises = useCallback(async (currentOffset) => {
    try {
      setIsLoading(true);
      
      const cacheKey = `${CACHE_KEYS.EXERCISES}_offset_${currentOffset}`;
      
      // Verifica cache primeiro
      if (isCacheValid(cacheKey)) {
        const cachedExercises = getFromCache(cacheKey);
        setAllExercises(prev => {
          const newExercises = cachedExercises.filter(newEx => 
            !prev.some(ex => ex.id === newEx.id)
          );
          return [...prev, ...newExercises];
        });
        setHasMore(cachedExercises.length === PAGE_SIZE);
        return;
      }

      

      // Busca da API
      const response = await fetch(
        `${API_BASE_URL}/exerciseinfo/?limit=${PAGE_SIZE}&offset=${currentOffset}`
      );
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      const newExercises = data.results;

      setAllExercises(prev => {
        // Filtra para evitar duplicatas
        const filteredNew = newExercises.filter(newEx => 
          !prev.some(ex => ex.id === newEx.id)
        );
        return [...prev, ...filteredNew];
      });

      setHasMore(newExercises.length === PAGE_SIZE);
      saveToCache(cacheKey, newExercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setIsLoading(false);
      if (initialLoad) setInitialLoad(false);
    }
  }, [initialLoad]);

  // Busca vídeos
  const fetchVideos = async () => {
    try {
      if (isCacheValid(CACHE_KEYS.VIDEOS)) {
        setVideos(getFromCache(CACHE_KEYS.VIDEOS));
        return;
      }

      let allVideos = [];
      let nextUrl = `${API_BASE_URL}/video/`;
      
      while (nextUrl) {
        const response = await fetch(nextUrl);
        const data = await response.json();
        allVideos = [...allVideos, ...data.results];
        nextUrl = data.next;
      }
      
      setVideos(allVideos);
      saveToCache(CACHE_KEYS.VIDEOS, allVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  // Busca imagens de músculos
  const fetchMuscleImages = async () => {
    try {
      if (isCacheValid(CACHE_KEYS.MUSCLES)) {
        setMuscleImages(getFromCache(CACHE_KEYS.MUSCLES));
        return;
      }

      const response = await fetch(`${API_BASE_URL}/muscle/`);
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
      saveToCache(CACHE_KEYS.MUSCLES, imagesMap);
    } catch (error) {
      console.error("Error fetching muscle images:", error);
    }
  };

  // Busca categorias
  const fetchCategories = async () => {
    try {
      if (isCacheValid(CACHE_KEYS.CATEGORIES)) {
        setCategories(getFromCache(CACHE_KEYS.CATEGORIES));
        return;
      }

      const response = await fetch(`${API_BASE_URL}/exercisecategory/`);
      const data = await response.json();
      setCategories(data.results);
      saveToCache(CACHE_KEYS.CATEGORIES, data.results);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Busca equipamentos
  const fetchEquipment = async () => {
    try {
      if (isCacheValid(CACHE_KEYS.EQUIPMENT)) {
        setEquipment(getFromCache(CACHE_KEYS.EQUIPMENT));
        return;
      }

      const response = await fetch(`${API_BASE_URL}/equipment/`);
      const data = await response.json();
      setEquipment(data.results);
      saveToCache(CACHE_KEYS.EQUIPMENT, data.results);
    } catch (error) {
      console.error("Error fetching equipment:", error);
    }
  };

  // Busca músculos
  const fetchMuscles = async () => {
    try {
      if (isCacheValid(CACHE_KEYS.MUSCLES)) {
        const cachedData = getFromCache(CACHE_KEYS.MUSCLES);
        if (cachedData.results) {
          setMuscles(cachedData.results);
        }
        return;
      }

      const response = await fetch(`${API_BASE_URL}/muscle/`);
      const data = await response.json();
      setMuscles(data.results);
      saveToCache(CACHE_KEYS.MUSCLES, data);
    } catch (error) {
      console.error("Error fetching muscles:", error);
    }
  };

  // Efeito para carregar dados iniciais
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      
      // Carrega dados dos filtros primeiro
      await Promise.all([
        fetchCategories(),
        fetchEquipment(),
        fetchMuscles()
      ]);
      
      // Carrega primeira página de exercícios
      await fetchExercises(0);
      
      // Carrega outros dados em segundo plano
      Promise.all([
        fetchVideos(),
        fetchMuscleImages()
      ]);
    };

    fetchInitialData();
  }, [fetchExercises]);

  // Efeito para scroll infinito
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || !hasMore || initialLoad) return;
      
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const scrollPosition = scrollTop + clientHeight;
      
      // Dispara quando estiver a 300px do final
      if (scrollHeight - scrollPosition < 300) {
        setOffset(prev => prev + PAGE_SIZE);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, hasMore, initialLoad]);

  // Efeito para carregar mais exercícios quando offset muda
  useEffect(() => {
    if (offset > 0) {
      fetchExercises(offset);
    }
  }, [offset, fetchExercises]);

  // Funções auxiliares
  const toggleExercise = (exerciseId) => {
    setExpandedExerciseId(expandedExerciseId === exerciseId ? null : exerciseId);
  };

  const getExerciseVideos = (exerciseId) => {
    return videos.filter(video => {
      const videoExerciseId = typeof video.exercise === 'object' 
        ? video.exercise.id 
        : video.exercise;
      return videoExerciseId === exerciseId;
    });
  };

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedEquipment(null);
    setSelectedMuscle(null);
    setSearchTerm('');
  };

  // Filtra exercícios
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

  // Renderização do skeleton loader
  const renderSkeletonLoader = () => (
    <div className="exercises-list">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="exercise-skeleton">
          <div className="skeleton-title"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-text"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="exercise-app">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/">IronCore App</Link>
        </div>
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/exercises" className="nav-link active">Exercícios</Link>
          <Link to="/workouts" className="nav-link">Treinos</Link>
        </div>
      </nav>

      <div className="exercise-page">
        <div className="filters-section">
          <h2>Filtrar Exercícios</h2>
          
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar Exercício..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            className={`favorites-toggle ${showFavorites ? 'active' : ''}`}
            onClick={() => setShowFavorites(!showFavorites)}
          >
            {showFavorites ? 'Mostrar Todos' : 'Mostrar Favoritos'}
          </button>
          
          <div className="filter-group">
            <h3>Categorias</h3>
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
            <h3>Equipamentos</h3>
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
            <h3>Músculos</h3>
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
            Restaurar Filtros
          </button>
        </div>
        
        <div className="exercises-section">
          <h2>{showFavorites ? 'Favoritos' : `Exercícios (${filteredExercises.length})`}</h2>
          
          {showFavorites ? (
            <FavoriteExercises 
              allExercises={filteredExercises}
              getExerciseVideos={getExerciseVideos}
              muscleImages={muscleImages}
            />
          ) : initialLoad ? (
            renderSkeletonLoader()
          ) : filteredExercises.length === 0 ? (
            <div className="no-results">
              Não foram encontrados exercícios com esses filtros.
            </div>
          ) : (
            <>
              <div className="exercises-list">
                {filteredExercises.map(exercise => (
                  <ExerciseCard 
                    key={exercise.id}
                    exercise={exercise}
                    isExpanded={expandedExerciseId === exercise.id}
                    onToggle={() => toggleExercise(exercise.id)}
                    getExerciseVideos={getExerciseVideos}
                    muscleImages={muscleImages}
                  />
                ))}
              </div>
              {isLoading && <div className="loading-indicator">Carregando mais exercícios...</div>}
              {!hasMore && <div className="no-more-results">Todos os exercícios foram carregados</div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExercisePage;