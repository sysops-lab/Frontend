import { useEffect, useState } from "react";

import HomeButton from "../components/HomeButton";

import { useNavigate } from "react-router-dom";

import { songAPI, displayAPI } from "../services/electronApi";

export default function Songs() {
  const navigate = useNavigate();

  const [songs, setSongs] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedSong, setSelectedSong] = useState(null);

  async function loadSongs() {
    const result = await songAPI.list(search);

    setSongs(result);
  }

  async function selectSong(id) {
    const song = await songAPI.get(id);

    setSelectedSong(song);
  }

  async function showSlide(slide) {
    await displayAPI.showSlide({
      title: selectedSong.title,

      content: slide.content,

      type: slide.slide_type,
    });
  }

  useEffect(() => {
    loadSongs();
  }, [search]);

  return (
    <div className="application">
      <header className="topbar">
        <HomeButton />

        <h1>Song Library</h1>

        <button onClick={() => navigate("/songs/new")}>+ New Song</button>
      </header>

      <main className="workspace">
        <section className="sidebar">
          <input
            placeholder="Search songs..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="song-list">
            {songs.map((song) => (
              <button
                key={song.id}
                className="song-item"
                onClick={() => selectSong(song.id)}
              >
                <strong>{song.title}</strong>

                <small>{song.artist || ""}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="content">
          {selectedSong && (
            <>
              <h2>{selectedSong.title}</h2>

              <p>{selectedSong.artist}</p>

              <button
                type="button"
                onClick={() => navigate(`/songs/edit/${selectedSong.id}`)}
              >
                ✏️ Edit Song
              </button>

              <div className="slides">
                {selectedSong.slides.map((slide) => (
                  <button
                    className="slide-card"
                    key={slide.id}
                    onClick={() => showSlide(slide)}
                  >
                    <strong>{slide.slide_type}</strong>

                    <p>{slide.content}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
