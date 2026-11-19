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

  async function deleteSong(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this song? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      const result = await songAPI.delete(id);

      if (!result.success) {
        throw new Error(result.message);
      }

      // Remove song from library
      setSongs((prevSongs) => prevSongs.filter((song) => song.id !== id));

      // Clear selected song
      if (selectedSong?.id === id) {
        setSelectedSong(null);
      }

      alert("Song deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);

      alert(error.message || "Unable to delete song.");
    }
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
              <div className="song-actions">
                <button
                  type="button"
                  onClick={() => navigate(`/songs/edit/${selectedSong.id}`)}
                >
                  ✏️ Edit Song
                </button>

                <button
                  type="button"
                  className="delete-song-btn"
                  onClick={() => deleteSong(selectedSong.id)}
                >
                  🗑️ Delete Song
                </button>
              </div>

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
