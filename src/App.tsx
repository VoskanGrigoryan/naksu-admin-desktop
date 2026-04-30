import { useEffect } from "react";
import RoutesConfig from "./routes";

function App() {
  useEffect(() => {
    import("./views/dashboard");
    import("./views/users");
    import("./views/userDetail");
    import("./views/calendar");
    import("./views/auth");
  }, []);

  return (
    <div>
      <RoutesConfig />
    </div>
  );
}

export default App;
