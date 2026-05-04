import { Routes, Route } from "react-router";
import HomePage from "@/pages/HomePage";
import TestsPage from "@/pages/TestsPage";
import TestRunner from "@/pages/TestRunner";
import ProfilePage from "@/pages/ProfilePage";
import ResourcesPage from "@/pages/ResourcesPage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";

// ЖАҢА қосылған жүйелер:
import AITrainer from "@/pages/AITrainer";
import TestCreator from "@/pages/TestCreator";
import AITestGenerator from "@/pages/AITestGenerator";
import MyTests from "@/pages/MyTests";
import CustomTestRunner from "@/pages/CustomTestRunner";

function App() {
  return (
    <Routes>
      {/* Бұрынғы роуттар */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/tests" element={<TestsPage />} />
      <Route path="/test/:testId" element={<TestRunner />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/resources" element={<ResourcesPage />} />

      {/* Жаңа роуттар */}
      <Route path="/ai-trainer" element={<AITrainer />} />
      <Route path="/test-creator" element={<TestCreator />} />
      <Route path="/ai-test-generator" element={<AITestGenerator />} />
      <Route path="/my-tests" element={<MyTests />} />
      <Route path="/custom-test/:testId" element={<CustomTestRunner />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
