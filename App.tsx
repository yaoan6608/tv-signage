import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Tags from "./pages/Tags";
import CustomFields from "./pages/CustomFields";
import Layout from "./pages/Layout";
import Marquee from "./pages/Marquee";
import Display from "./pages/Display";
import Analytics from "./pages/Analytics";
import BatchUpload from "./pages/BatchUpload";
import ProductSort from "./pages/ProductSort";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/products"} component={Products} />
      <Route path={"/tags"} component={Tags} />
      <Route path={"/fields"} component={CustomFields} />
      <Route path={"/layout"} component={Layout} />
      <Route path={"/marquee"} component={Marquee} />
      <Route path={"/display"} component={Display} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/batch-upload"} component={BatchUpload} />
      <Route path={"/product-sort"} component={ProductSort} />
      <Route path={"/404"} component={NotFound} />
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
        defaultTheme="dark"
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
