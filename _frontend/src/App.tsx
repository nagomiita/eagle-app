import { AppProvider } from "./contexts/AppContext";
import AppView from "./AppView";

function App() {
  return (
    <AppProvider>
      <AppView />
    </AppProvider>
  );
}

export default App;
