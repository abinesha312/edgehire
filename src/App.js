// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Simulator from './components/Simulator';
import Demo from './components/Demo';
import './App.css';

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const AppContent = () => {
  const location = useLocation();

  return (
    <div className="App fade-in">
      <nav>
        <ul>
          <li><Link to="/" className="nav-link">Home</Link></li>
          <li><Link to="/simulator/123" className="nav-link">Simulator</Link></li>
          <li><Link to="/demo" className="nav-link">Demo</Link></li>
        </ul>
      </nav>

      <TransitionGroup>
        <CSSTransition
          key={location.pathname}
          classNames="content-transition"
          timeout={300}
        >
          <div className="content">
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/simulator/:id" element={<Simulator />} />
              <Route path="/demo" element={<Demo />} />
            </Routes>
          </div>
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
};

const Home = () => (
  <div className="home slide-in">
    <h1>Welcome to EdgeHire </h1> <h4>AI Interview System</h4>
    <p>Click on Simulator to start an interview or Demo to test recording functionality.</p>

    <div class="eye-container">
      <div class="eye">
        <div class="pupil"></div>
      </div>
      <div class="eyelid top"></div>
      <div class="eyelid bottom"></div>
    </div>
  </div>
);

export default App;