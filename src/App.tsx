import {ThemeProvider} from "./context/ThemeContext";
import AnimalsListScreen from "./screens/AnimalsList/AnimalsListScreen";

export default function App() {

  return (
      <ThemeProvider>
        <AnimalsListScreen />
      </ThemeProvider>
  );
}
