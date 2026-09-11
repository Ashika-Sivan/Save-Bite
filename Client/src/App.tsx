
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import InstallPWAPrompt from "./components/common/InstallPWAPrompt";

function App() {

  return (
    <>
      <AppRoutes/>
      <InstallPWAPrompt />
      <Toaster position="top-right" />
    </>
  );
}

export default App;