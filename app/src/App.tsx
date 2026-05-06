import { Routes, Route } from "react-router";
import HomePage from "@/pages/HomePage";
import TestsPage from "@/pages/TestsPage";
import ProfilePage from "@/pages/ProfilePage";
import ResourcesPage from "@/pages/ResourcesPage";
import LoginPage from "@/pages/LoginPage";
import TestRunner from "@/pages/TestRunner";

// Жаңа беттер (барлығы істейтін)
import AITrainer from "@/pages/AITrainer";
import TestCreator from "@/pages/TestCreator";
import AITestGenerator from "@/pages/AITestGenerator";
import MyTests from "@/pages/MyTests";
import CustomTestRunner from "@/pages/CustomTestRunner";
import SearchQuestions from "@/pages/SearchQuestions";
import ProgressPage from "@/pages/ProgressPage";
import GroupTest from "@/pages/GroupTest";
import ShareTest from "@/pages/ShareTest";
import GamificationPage from "@/pages/GamificationPage";
import LiveClass from "@/pages/LiveClass";
import UpdatesPage from "@/pages/UpdatesPage";
import SyllabusPage from "@/pages/SyllabusPage";

// Кез келген құрылғыда дұрыс жұмыс істейтін 404 бет
function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p>Бет табылмады</p>
      <a href="/" className="text-emerald-400 hover:underline">Басты бетке</a>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/tests" element={<TestsPage />} />
      <Route path="/test/:testId" element={<TestRunner />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/resources" element={<ResourcesPage />} />

      {/* Жаңа беттер */}
      <Route path="/ai-trainer" element={<AITrainer />} />
      <Route path="/test-creator" element={<TestCreator />} />
      <Route path="/ai-test-generator" element={<AITestGenerator />} />
      <Route path="/my-tests" element={<MyTests />} />
      <Route path="/custom-test/:testId" element={<CustomTestRunner />} />
      <Route path="/search" element={<SearchQuestions />} />
      <Route path="/progress" element={<ProgressPage />} />
      <Route path="/group-test" element={<GroupTest />} />
      <Route path="/share/:testId" element={<ShareTest />} />
      <Route path="/achievements" element={<GamificationPage />} />
      <Route path="/live/:roomId?" element={<LiveClass />} />
      <Route path="/updates" element={<UpdatesPage />} />
      <Route path="/syllabus" element={<SyllabusPage />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
