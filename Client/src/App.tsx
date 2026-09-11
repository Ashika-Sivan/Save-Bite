
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import { useSocket } from "./hooks/useSocket";
import InstallPWAPrompt from "./components/common/InstallPWAPrompt";

function App() {
  useSocket();

  return (
    <>
      <AppRoutes/>
      <InstallPWAPrompt />
      <Toaster position="top-right" />
    </>
  );
}

export default App;