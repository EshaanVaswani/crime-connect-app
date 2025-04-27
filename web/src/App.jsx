import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import PoliceDashboard from "./components/PoliceDashboard";

function App() {
   const [count, setCount] = useState(0);

   return (
      <>
         <div>
            <PoliceDashboard />
         </div>
      </>
   );
}

export default App;
