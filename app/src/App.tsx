import { Routes, Route } from "react-router";
import HomePage from "@/pages/HomePage";
import TestsPage from "@/pages/TestsPage";
import TestRunner from "@/pages/TestRunner";
import ProfilePage from "@/pages/ProfilePage";
import ResourcesPage from "@/pages/ResourcesPage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/tests" element={<TestsPage />} />
      <Route path="/test/:testId" element={<TestRunner />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/resources" element={<ResourcesPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
