import React from 'react';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  return (
    <div className="App">
      <Sidebar />
      <div className="copyright">
        © Built by Aguider 2024
      </div>
    </div>
  );
}

export default App;