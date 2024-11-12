// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Simulator from './components/Simulator';
import Demo from './components/Demo';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="App" style={styles.app}>
        <nav style={styles.nav}>
          <ul style={styles.navList}>
            <li><Link to="/" style={styles.navLink}>Home</Link></li>
            <li><Link to="/simulator/123" style={styles.navLink}>Simulator</Link></li>
            <li><Link to="/demo" style={styles.navLink}>Demo</Link></li>
          </ul>
        </nav>

        <div style={styles.content}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/simulator/:id" element={<Simulator />} />
            <Route path="/demo" element={<Demo />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

const Home = () => (
  <div style={styles.home}>
    <h1 style={styles.title}>Welcome to the AI Interview System</h1>
    <p style={styles.text}>Click on Simulator to start an interview or Demo to test recording functionality.</p>
  </div>
);

const styles = {
  app: {
    backgroundColor: '#1d2731',
    minHeight: '100vh',
    color: '#ffbb39',
    fontFamily: 'Arial, sans-serif',
  },
  nav: {
    backgroundColor: '#083c5d',
    padding: '1rem',
  },
  navList: {
    listStyle: 'none',
    display: 'flex',
    justifyContent: 'center',
    padding: 0,
  },
  navLink: {
    color: '#ffbb39',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    margin: '0 0.5rem',
    borderRadius: '5px',
    transition: 'background-color 0.3s',
  },
  content: {
    padding: '2rem',
  },
  home: {
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
  },
  text: {
    fontSize: '1.2rem',
  },
};

export default App;
