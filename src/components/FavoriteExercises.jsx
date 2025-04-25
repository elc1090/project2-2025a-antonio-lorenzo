import { useState, useEffect } from 'react';
import ExerciseCard from './ExerciseCard';

const FavoriteExercises = ({ allExercises, getExerciseVideos, muscleImages }) => {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoriteExercises, setFavoriteExercises] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  // Carrega os favoritos do localStorage
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favoriteExercises') || '[]');
    setFavoriteIds(favorites);
  }, []);

  // Filtra os exercícios favoritos
  useEffect(() => {
    if (allExercises && allExercises.length > 0) {
      const favs = allExercises.filter(ex => favoriteIds.includes(ex.id));
      setFavoriteExercises(favs);
    }
  }, [allExercises, favoriteIds]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (favoriteExercises.length === 0) {
    return (
      <div className="no-results">
        <h3>No favorite exercises</h3>
        <p>Add exercises to favorites by clicking the star ☆</p>
      </div>
    );
  }

  return (
    <div className="exercises-list">
      {favoriteExercises.map(exercise => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          isExpanded={expandedId === exercise.id}
          onToggle={() => toggleExpand(exercise.id)}
          getExerciseVideos={getExerciseVideos}
          muscleImages={muscleImages}
        />
      ))}
    </div>
  );
};

export default FavoriteExercises;