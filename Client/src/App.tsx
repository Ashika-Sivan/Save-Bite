
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import InstallPWAPrompt from "./components/common/InstallPWAPrompt";
import { useSocket } from "./hooks/useSocket";

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