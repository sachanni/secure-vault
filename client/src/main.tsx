import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Ensure no duplicate rendering
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
