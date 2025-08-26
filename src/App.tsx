import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import {addAnimal, getAnimalTemplate} from "./services/firebase/firebaseService";
import {useEffect} from "react";

const addSpider = async () => {
  const newTarantula = getAnimalTemplate("tarantula");
  newTarantula.name = "Charlotte";
  newTarantula.species = "Grammostola rosea";
  const result = await addAnimal(newTarantula);
  console.log(result)
}

export default function App() {

  useEffect(() => {
    (async() => await addSpider())()
  }, []);

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
