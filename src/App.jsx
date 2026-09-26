import { lazy, Suspense, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Projects from "./components/Projects";
import Research from "./components/Research";
import Experience from "./components/Experience";
import Contact from "./components/Contact";
import Forge from "./components/Forge";
import "./App.css";

const Coach = lazy(() => import("./coach/Coach"));

function App() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <Router>
      <div className={isDark ? "dark" : ""}>
        <Header isDark={isDark} toggleTheme={toggleTheme} />
        <Routes>
          <Route path="/" element={<><Hero /><About /></>} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/research" element={<Research />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/forge" element={<Forge />} />
          <Route
            path="/coach/*"
            element={
              <Suspense fallback={<div className="coach-loading" />}>
                <Coach />
              </Suspense>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
