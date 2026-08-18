import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import NewLesson from "./pages/NewLesson";
import LessonsList from "./pages/LessonsList";
import Archive from "./pages/Archive";
import LessonDetail from "./pages/LessonDetail";
import Library from "./pages/Library";
import Settings from "./pages/Settings";
import ModulePlaceholder from "./pages/ModulePlaceholder";
import Backup from "./pages/Backup";
import Exams from "./pages/Exams";
import ExamEditor from "./pages/ExamEditor";


function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/lessons/new"} component={NewLesson} />
      <Route path={"/prepare"} component={NewLesson} />
      <Route path={"/prepare.html"} component={NewLesson} />
      <Route path={"/lessons/:id"} component={LessonDetail} />
      <Route path={"/lessons"} component={LessonsList} />
      <Route path={"/saved-lessons"} component={LessonsList} />
      <Route path={"/archive"} component={Archive} />
      <Route path={"/exams/editor"} component={ExamEditor} />
      <Route path={"/exams"} component={Exams} />
      <Route path={"/backup"} component={Backup} />
      <Route path={"/library"} component={Library} />
      <Route path={"/library.html"} component={Library} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
