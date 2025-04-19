import { useState } from 'react';
import MuscleDiagram from './MuscleDiagram';
import './ExerciseCard.css';

const ExerciseCard = ({ exercise, isExpanded, onToggle, videos, muscleImages }) => {
  const primaryTranslation = exercise.translations[0];
  const primaryImage = exercise.images.find(img => img.is_main) || exercise.images[0];
  const [activeTab, setActiveTab] = useState('description');

  return (
    <div className={`exercise-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="exercise-header" onClick={onToggle}>
        <div>
          <h3>{primaryTranslation.name}</h3>
          <span className="category-badge">{exercise.category.name}</span>
        </div>
        <span className="toggle-icon">
          {isExpanded ? '−' : '+'}
        </span>
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

                {videos.length > 0 && (
                  <div className="videos-container">
                    <h4>Vídeos</h4>
                    <div className="videos-grid">
                      {videos.map(video => (
                        <div key={video.id} className="video-item">
                          <video controls>
                            <source src={video.video} type="video/mp4" />
                            Seu navegador não suporta vídeos HTML5.
                          </video>
                          <p>Duração: {video.duration}s</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
};

export default ExerciseCard;