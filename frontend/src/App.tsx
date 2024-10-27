import axios from "axios";
import { useEffect, useState } from "react";
import "@/App.css";

interface Character {
  id: number;
  images: string;
}

const App = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  useEffect(() => {
    fetchCharacters();
  }, []);
  const fetchCharacters = async () => {
    const apiUrl = "https://narutodb.xyz/api/character";

    const result = await axios.get(apiUrl);
    setCharacters(result.data.characters);
    console.log(result);
  };
  return (
    <div className="container">
      <main>
        <div className="cards-container">
          {characters.map((character) => {
            return (
              <div className="card" key={character.id}>
                <img
                  src={
                    character.images[0] != null
                      ? character.images[0]
                      : "dummy.png"
                  }
                  alt="character"
                  className="card-image"
                />
              </div>
            );
          })}
        </div>
      </main>
      App
    </div>
  );
};

export default App;
