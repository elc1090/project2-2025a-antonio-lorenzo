import { useState, useEffect, forwardRef } from 'react';
import MuscleDiagram from './MuscleDiagram';
import './ExerciseCard.css';

const ExerciseCard = forwardRef(({ 
  exercise, 
  isExpanded, 
  onToggle, 
  getExerciseVideos, 
  muscleImages,
  id // Nova prop para identificação do card
}, ref) => {
  const primaryTranslation = exercise.translations[0] || exercise.translations.find(t => t.language === 'pt-BR') || exercise.translations[0];
  const primaryImage = exercise.images.find(img => img.is_main) || exercise.images[0];
  const [activeTab, setActiveTab] = useState('description');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favoriteExercises') || '[]');
    setIsFavorite(favorites.includes(exercise.id));
  }, [exercise.id]);

  const toggleFavorite = (e) => {
    e.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem('favoriteExercises') || '[]');
    const newFavorites = isFavorite
      ? favorites.filter(id => id !== exercise.id)
      : [...favorites, exercise.id];
    
    localStorage.setItem('favoriteExercises', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  return (
    <div 
      className={`exercise-card ${isExpanded ? 'expanded' : ''}`}
      id={id} // Adiciona o ID para scroll
      ref={ref} // Adiciona a ref para possível manipulação
    >
      <div className="exercise-header" onClick={onToggle}>
        <div>
          <h3>{primaryTranslation.name}</h3>
          <span className="category-badge">{exercise.category.name}</span>
        </div>
        <div className="header-actions">
          <button 
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={toggleFavorite}
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            {isFavorite ? '★' : '☆'}
          </button>
          <span className="toggle-icon">
            {isExpanded ? '−' : '+'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="exercise-details">
          <div className="tabs">
            <button 
              className={activeTab === 'description' ? 'active' : ''}
              onClick={() => setActiveTab('description')}
            >
              Descrição
            </button>
            <button 
              className={activeTab === 'media' ? 'active' : ''}
              onClick={() => setActiveTab('media')}
            >
              Mídia
            </button>
            <button 
              className={activeTab === 'muscles' ? 'active' : ''}
              onClick={() => setActiveTab('muscles')}
            >
              Músculos
            </button>
            <button 
              className={activeTab === 'videos' ? 'active' : ''}
              onClick={() => setActiveTab('videos')}
            >
              Vídeos
            </button>
          </div>

          {activeTab === 'description' && (
            <div className="tab-content">
              <div 
                className="exercise-description" 
                dangerouslySetInnerHTML={{ __html: primaryTranslation.description }} 
              />
              
              <div className="exercise-meta">
                {exercise.equipment.length > 0 && (
                  <div className="meta-item">
                    <strong>Equipamento:</strong>
                    <span>{exercise.equipment.map(e => e.name).join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="tab-content">
              <div className="media-container">
                {primaryImage && (
                  <div className="exercise-image">
                    <img 
                      src={primaryImage.image} 
                      alt={primaryTranslation.name}
                      onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Imagem+indisponível'}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="tab-content">
              <div className="videos-container">
                <h4>Vídeos</h4>
                <div className="videos-grid">
                  {getExerciseVideos(exercise.id).length > 0 ? (
                    getExerciseVideos(exercise.id).map(video => (
                      <div key={video.id} className="video-item">
                        <div className="video-wrapper">
                          <video controls preload="metadata">
                            <source 
                              src={video.video} 
                              type={`video/${video.codec === 'hevc' ? 'mp4' : 'mp4'}`} 
                            />
                            Seu navegador não suporta vídeos HTML5.
                          </video>
                        </div>
                        <div className="video-info">
                          <p>Duração: {video.duration}s</p>
                          <p>Resolução: {video.width}x{video.height}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Nenhum vídeo disponível para este exercício.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'muscles' && (
            <div className="tab-content">
              <MuscleDiagram 
                primaryMuscles={exercise.muscles || []}
                secondaryMuscles={exercise.muscles_secondary || []}
                muscleImages={muscleImages}
              />
              
              <div className="muscle-list">
                {exercise.muscles?.length > 0 && (
                  <div className="muscle-group">
                    <h4>Músculos Principais</h4>
                    <ul>
                      {exercise.muscles.map(muscle => (
                        <li key={muscle.id}>{muscle.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {exercise.muscles_secondary?.length > 0 && (
                  <div className="muscle-group">
                    <h4>Músculos Secundários</h4>
                    <ul>
                      {exercise.muscles_secondary.map(muscle => (
                        <li key={muscle.id}>{muscle.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default ExerciseCard;