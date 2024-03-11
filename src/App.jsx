import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { REGISTER_PATH } from "./constants/RegisterPath";
import Register from "./pages/Register";
import LogIn from "./pages/LogIn";
import { AuthProvider } from "./contexts/AuthContext";
import HomeScreen from "./pages/HomeScreen";

const routes = [
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
