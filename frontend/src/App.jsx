import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Resources from "./pages/Resources.jsx";
import Incidents from "./pages/Incidents.jsx";
import CityMap from "./pages/CityMap.jsx";
import Dispatch from "./pages/Dispatch.jsx";
import Priority from "./pages/Priority.jsx";
import Mathematics from "./pages/Mathematics.jsx";
import Communication from "./pages/Communication.jsx";
import Reports from "./pages/Reports.jsx";

function App() {
  return (
    <BrowserRouter>

      <div className="app">

        <Sidebar />

        <main className="main">

          <Routes>

            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/incidents"
              element={<Incidents />}
            />

            <Route
              path="/resources"
              element={<Resources />}
            />

            <Route
              path="/city-map"
              element={<CityMap />}
            />

            <Route
              path="/dispatch"
              element={<Dispatch />}
            />

            <Route
              path="/priority"
              element={<Priority />}
            />

            <Route
              path="/mathematics"
              element={<Mathematics />}
            />

            <Route
              path="/communication"
              element={<Communication />}
            />

            <Route
              path="/reports"
              element={<Reports />}
            />

          </Routes>

        </main>

      </div>

    </BrowserRouter>
  );
}

export default App;