import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import LiveChart from './LiveChart';

function App() {
  return (
    <div className="App">
      <LiveChart sensorId="sensor3" title="Living room"></LiveChart>
      <LiveChart sensorId="sensor1" title="Bedroom"></LiveChart>
    </div>
  );
}

export default App;
