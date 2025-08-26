import {addAnimal, getAnimalTemplate} from "./services/firebase/firebaseService";
import {ThemeProvider} from "./context/ThemeContext";
import AnimalsListScreen from "./screens/AnimalsList/AnimalsListScreen";

const addSpider = async () => {
  const newTarantula = getAnimalTemplate("tarantula");
  newTarantula.name = "Charlotte";
  newTarantula.species = "Grammostola rosea";
  const result = await addAnimal(newTarantula);
  console.log(result)
}

export default function App() {

  return (
      <ThemeProvider>
        <AnimalsListScreen />
      </ThemeProvider>
  );
}
