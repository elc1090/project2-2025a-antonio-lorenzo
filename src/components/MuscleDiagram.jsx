import './MuscleDiagram.css';

const MuscleDiagram = ({ primaryMuscles = [], secondaryMuscles = [], muscleImages }) => {
  const baseBodyImages = {
    front: 'https://wger.de/static/images/muscles/muscular_system_front.svg',
    back: 'https://wger.de/static/images/muscles/muscular_system_back.svg'
  };

  return (
    <div className="muscle-diagram-container">
      <div className="muscle-view">
        <h4>Vista Frontal</h4>
        <div className="body-with-muscles">
          <img 
            src={baseBodyImages.front} 
            alt="Silhueta frontal" 
            className="base-body"
          />
          {primaryMuscles
            .filter(muscle => muscle.is_front)
            .map(muscle => (
              muscleImages[muscle.id]?.main && (
                <img
                  key={`front-${muscle.id}`}
                  src={muscleImages[muscle.id].main}
                  alt={muscle.name}
                  className="muscle-overlay primary"
                />
              )
            ))}
          {secondaryMuscles
            .filter(muscle => muscle.is_front)
            .map(muscle => (
              muscleImages[muscle.id]?.main && (
                <img
                  key={`front-sec-${muscle.id}`}
                  src={muscleImages[muscle.id].main}
                  alt={muscle.name}
                  className="muscle-overlay secondary"
                />
              )
            ))}
        </div>
      </div>

      <div className="muscle-view">
        <h4>Vista Traseira</h4>
        <div className="body-with-muscles">
          <img 
            src={baseBodyImages.back} 
            alt="Silhueta traseira" 
            className="base-body"
          />
          {primaryMuscles
            .filter(muscle => !muscle.is_front)
            .map(muscle => (
              muscleImages[muscle.id]?.secondary && (
                <img
                  key={`back-${muscle.id}`}
                  src={muscleImages[muscle.id].secondary}
                  alt={muscle.name}
                  className="muscle-overlay primary"
                />
              )
            ))}
          {secondaryMuscles
            .filter(muscle => !muscle.is_front)
            .map(muscle => (
              muscleImages[muscle.id]?.secondary && (
                <img
                  key={`back-sec-${muscle.id}`}
                  src={muscleImages[muscle.id].secondary}
                  alt={muscle.name}
                  className="muscle-overlay secondary"
                />
              )
            ))}
        </div>
      </div>
    </div>
  );
};

export default MuscleDiagram;