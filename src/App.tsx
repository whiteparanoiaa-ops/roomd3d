import { Scene } from './components/3d/Scene';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';

export default function App() {
  return (
    <div className="app-container">
      <Toolbar />
      <div className="main-layout">
        <Sidebar />
        <Scene />
      </div>
    </div>
  );
}
