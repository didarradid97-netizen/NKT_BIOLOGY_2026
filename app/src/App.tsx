import { Routes, Route } from "react-router-dom";

// Негізгі беттер
import HomePage from "@/pages/HomePage";
import TestsPage from "@/pages/TestsPage";
import ProfilePage from "@/pages/ProfilePage";
import ResourcesPage from "@/pages/ResourcesPage";
import LoginPage from "@/pages/LoginPage";

// AI жүйелер
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

// 1-кезең: AI Core
import AICoach from "@/pages/AICoach";
import AIDiagnosis from "@/pages/AIDiagnosis";
import MentorHub from "@/pages/MentorHub";
import DailyHub from "@/pages/DailyHub";

// 2-кезең: Voice + Photo
import VoiceQuizPage from "@/pages/VoiceQuizPage";
import PhotoQuizPage from "@/pages/PhotoQuizPage";
import VoiceTeacher from "@/pages/VoiceTeacher";
import SmartScan from "@/pages/SmartScan";

// 3-кезең: Multiplayer + Leaderboard
import BattlePage from "@/pages/BattlePage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import DuelMode from "@/pages/DuelMode";
import GlobalRating from "@/pages/GlobalRating";

// Қосымша
import VirtualLab from "@/pages/VirtualLab";
import TeacherHub from "@/pages/TeacherHub";

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
      {/* Негізгі */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/tests" element={<TestsPage />} />
      <Route path="/test/:testId" element={<CustomTestRunner />} />
      <Route path="/custom-test/:testId" element={<CustomTestRunner />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/resources" element={<ResourcesPage />} />

      {/* AI жүйелер */}
      <Route path="/ai-trainer" element={<AITrainer />} />
      <Route path="/ai-test-generator" element={<AITestGenerator />} />
      <Route path="/test-creator" element={<TestCreator />} />
      <Route path="/my-tests" element={<MyTests />} />
      <Route path="/search" element={<SearchQuestions />} />
      <Route path="/progress" element={<ProgressPage />} />
      <Route path="/group-test" element={<GroupTest />} />
      <Route path="/share/:testId" element={<ShareTest />} />
      <Route path="/achievements" element={<GamificationPage />} />
      <Route path="/live/:roomId?" element={<LiveClass />} />
      <Route path="/updates" element={<UpdatesPage />} />
      <Route path="/syllabus" element={<SyllabusPage />} />

      {/* 1-кезең: AI Coach */}
      <Route path="/ai-coach" element={<AICoach />} />
      <Route path="/ai-diagnosis" element={<AIDiagnosis />} />
      <Route path="/mentor" element={<MentorHub />} />
      <Route path="/daily" element={<DailyHub />} />

      {/* 2-кезең: Voice + Photo */}
      <Route path="/voice-quiz" element={<VoiceQuizPage />} />
      <Route path="/photo-quiz" element={<PhotoQuizPage />} />
      <Route path="/voice-teacher" element={<VoiceTeacher />} />
      <Route path="/smart-scan" element={<SmartScan />} />

      {/* 3-кезең: Multiplayer */}
      <Route path="/battle" element={<BattlePage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/duel" element={<DuelMode />} />
      <Route path="/global-rating" element={<GlobalRating />} />

      {/* Қосымша */}
      <Route path="/virtual-lab" element={<VirtualLab />} />
      <Route path="/teacher-hub" element={<TeacherHub />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
