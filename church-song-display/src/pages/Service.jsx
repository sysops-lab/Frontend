import HomeButton from "../components/HomeButton";

import { useEffect, useState } from "react";

import { songAPI, displayAPI } from "../services/electronApi";

export default function Service() {
  const [songs, setSongs] = useState([]);

  const [serviceSongs, setServiceSongs] = useState([]);

  const [currentSong, setCurrentSong] = useState(null);

  const [currentSlide, setCurrentSlide] = useState(0);

  /*
    |--------------------------------------------------------------------------
    | Load songs
    |--------------------------------------------------------------------------
    */

  useEffect(() => {
    async function loadSongs() {
      try {
        const result = await songAPI.list("");

        console.log("Songs returned:", result);

        /*
         * Make sure songs is always an array.
         */

        setSongs(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Failed to load songs:", error);

        setSongs([]);
      }
    }

    loadSongs();
  }, []);

  /*
    |--------------------------------------------------------------------------
    | Add song to service
    |--------------------------------------------------------------------------
    */

  function addSong(song) {
    setServiceSongs((previous) => [...previous, song]);
  }

  /*
    |--------------------------------------------------------------------------
    | Select song
    |--------------------------------------------------------------------------
    */

  async function selectSong(song) {
    /*
     * Make sure slides is always an array.
     */

    const slides = Array.isArray(song?.slides) ? song.slides : [];

    const safeSong = {
      ...song,
      slides,
    };

    console.log("Selected song:", JSON.stringify(safeSong, null, 2));

    setCurrentSong(safeSong);

    setCurrentSlide(0);

    /*
     * No slides?
     * Don't try to access slides[0].
     */

    if (slides.length === 0) {
      console.warn("Song has no slides:", song);

      return;
    }

    await displayAPI.showSlide({
      title: safeSong.title || "",

      content: slides[0]?.content || "",

      type: slides[0]?.slide_type || "lyrics",
    });
  }

  async function addSong(song) {
    try {
      const fullSong = await songAPI.get(song.id);

      console.log(
        "FULL SONG FROM DATABASE:",
        JSON.stringify(fullSong, null, 2),
      );

      if (!fullSong) {
        console.error("songAPI.get() returned null");

        return;
      }

      if (!Array.isArray(fullSong.slides)) {
        console.error(
          "Song returned without slides:",
          JSON.stringify(fullSong, null, 2),
        );

        return;
      }

      setServiceSongs((previous) => [...previous, fullSong]);
    } catch (error) {
      console.error("Failed to load complete song:", error);
    }
  }

  /*
    |--------------------------------------------------------------------------
    | Next slide
    |--------------------------------------------------------------------------
    */

  async function nextSlide() {
    if (!currentSong) {
      return;
    }

    const slides = Array.isArray(currentSong.slides) ? currentSong.slides : [];

    const next = currentSlide + 1;

    if (next >= slides.length) {
      return;
    }

    const slide = slides[next];

    if (!slide) {
      return;
    }

    setCurrentSlide(next);

    await displayAPI.showSlide({
      title: currentSong.title || "",

      content: slide.content || "",

      type: slide.slide_type || "lyrics",
    });
  }

  /*
    |--------------------------------------------------------------------------
    | Previous slide
    |--------------------------------------------------------------------------
    */

  async function previousSlide() {
    if (!currentSong) {
      return;
    }

    const slides = Array.isArray(currentSong.slides) ? currentSong.slides : [];

    const previous = currentSlide - 1;

    if (previous < 0) {
      return;
    }

    const slide = slides[previous];

    if (!slide) {
      return;
    }

    setCurrentSlide(previous);

    await displayAPI.showSlide({
      title: currentSong.title || "",

      content: slide.content || "",

      type: slide.slide_type || "lyrics",
    });
  }

  /*
    |--------------------------------------------------------------------------
    | Keyboard controls
    |--------------------------------------------------------------------------
    */

  useEffect(() => {
    function keyboard(event) {
      if (event.key === "ArrowRight") {
        nextSlide();
      }

      if (event.key === "ArrowLeft") {
        previousSlide();
      }

      if (event.key === "Escape") {
        displayAPI.clear();
      }
    }

    window.addEventListener("keydown", keyboard);

    return () => {
      window.removeEventListener("keydown", keyboard);
    };
  }, [currentSong, currentSlide]);

  /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

  return (
    <div className="application">
      <header className="topbar">
        <HomeButton />

        <h1>Service Presentation</h1>
      </header>

      <main className="workspace">
        <section className="sidebar">
          <h3>Song Library</h3>

          {songs.length === 0 ? (
            <p>No songs found.</p>
          ) : (
            songs.map((song) => (
              <button
                key={song.id}
                className="song-item"
                onClick={() => addSong(song)}
              >
                {song.title}
              </button>
            ))
          )}
        </section>

        <section className="content">
          <h2>Service Order</h2>

          {serviceSongs.length === 0 ? (
            <p>Add songs from the library.</p>
          ) : (
            serviceSongs.map((song, index) => (
              <button
                key={index}
                className="song-item"
                onClick={() => selectSong(song)}
              >
                {index + 1}. {song.title}
              </button>
            ))
          )}

          {currentSong && (
            <section>
              <h2>{currentSong.title}</h2>

              <p>
                Slide {currentSong.slides.length > 0 ? currentSlide + 1 : 0}
                {" / "}
                {currentSong.slides.length}
              </p>

              <div className="controls">
                <button onClick={previousSlide} disabled={currentSlide <= 0}>
                  ← Previous
                </button>

                <button
                  onClick={nextSlide}
                  disabled={currentSlide + 1 >= currentSong.slides.length}
                >
                  Next →
                </button>

                <button onClick={() => displayAPI.clear()}>Black Screen</button>
              </div>
            </section>
          )}
        </section>
      </main>
    </div>
  );
}
