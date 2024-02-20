import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WorkerScreen from "./pages/WorkerScreen";
import WorkerMap from "./components/WorkerMap";
import WorkerButton from "./components/WorkerButton";
import { REGISTER_PATH } from "./constants/RegisterPath";
import Register from "./pages/Register";
import LogIn from "./pages/LogIn";
import { AuthProvider } from "./contexts/AuthContext";
import HomeScreen from "./pages/HomeScreen";

const routes = [
  /*{
    path: "/",
    element: <WorkerScreen />,
  },*/
  {
    path: `/${REGISTER_PATH}`,
    element: <Register />,
  },
  {
    path: "/",
    element: <LogIn />,
  },
  {
    path: "/home-screen",
    element: <HomeScreen />,
  },
  {
    path: "/worker-map",
    element: <WorkerMap />,
  },
  {
    path: "/button",
    element: <WorkerButton />,
  },
];

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <Routes>
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
