import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ExercisePage from './pages/ExercisesPage';
import WorkoutsPage from './pages/WorkoutsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/exercises" element={<ExercisePage />} />
        <Route path="/workouts" element={<WorkoutsPage />} />
      </Routes>
    </Router>
  );
}

export default App;