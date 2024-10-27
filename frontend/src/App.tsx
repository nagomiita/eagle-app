import axios from "axios";
import { useEffect, useState } from "react";
import "@/App.css";

interface Character {
  id: number;
  images: string;
  name: string;
  debut: { appearsIn: string };
  personal: { species: string };
}

const App = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const limit = 800;

  useEffect(() => {
    fetchCharacters(page);
  }, [page]);
  const fetchCharacters = async (page: number) => {
    const apiUrl = `https://narutodb.xyz/api/character`;
    setIsLoading(true);
    const result = await axios.get(apiUrl, {
      params: { page: page, limit: limit },
    });
    console.log(result);
    setCharacters(result.data.characters);
    setIsLoading(false);
  };
  const handleNext = async () => {
    const nextPage = page + 1;
    await fetchCharacters(nextPage);
    setPage(nextPage);
  };
  const handlePrevious = async () => {
    if (page > 0) {
      const nextPage = page - 1;
      await fetchCharacters(nextPage);
      setPage(nextPage);
    }
  };
  return (
    <div className="container">
      <div className="header">
        <div className="header-content">
          <img src="logo.png" alt="logo" className="logo" />
        </div>
      </div>
      {isLoading ? (
        <div>Now Loading...</div>
      ) : (
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
                  <div className="card-content">
                    <h3 className="card-title">{character.name}</h3>
                  </div>
                  {character.debut?.appearsIn}
                  <p className="card-description"></p>
                  <div className="card-footer">
                    {character.personal?.species}
                    <span className="affiliation"></span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pager">
            <button
              className="prev"
              onClick={handlePrevious}
              disabled={page === 1}
            >
              Previous
            </button>

            <span className="page-number">{page}</span>
            <button className="next" onClick={handleNext} disabled={page === 2}>
              Next
            </button>
          </div>
        </main>
      )}
    </div>
  );
};

export default App;
