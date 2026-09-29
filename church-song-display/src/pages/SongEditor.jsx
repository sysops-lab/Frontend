import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { songAPI } from "../services/electronApi";

import HomeButton from "../components/HomeButton";

export default function SongEditor() {
  const navigate = useNavigate();

  const { id } = useParams();

  const isEditing = Boolean(id);

  const [title, setTitle] = useState("");

  const [artist, setArtist] = useState("");

  const [category, setCategory] = useState("");

  const [slides, setSlides] = useState([
    {
      slide_type: "verse",
      content: "",
    },
  ]);

  const [loading, setLoading] = useState(isEditing);

  const [saving, setSaving] = useState(false);

  /*
    |--------------------------------------------------------------------------
    | Load existing song when editing
    |--------------------------------------------------------------------------
    */

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    async function loadSong() {
      try {
        setLoading(true);

        const song = await songAPI.get(Number(id));

        console.log("Editing song:", JSON.stringify(song, null, 2));

        if (!song) {
          alert("Song not found.");

          navigate("/songs");

          return;
        }

        setTitle(song.title || "");

        setArtist(song.artist || "");

        setCategory(song.category || "");

        setSlides(
          Array.isArray(song.slides) && song.slides.length > 0
            ? song.slides.map((slide) => ({
                slide_type: slide.slide_type || "verse",

                content: slide.content || "",
              }))
            : [
                {
                  slide_type: "verse",

                  content: "",
                },
              ],
        );
      } catch (error) {
        console.error("Failed to load song:", error);

        alert("Failed to load song.");
      } finally {
        setLoading(false);
      }
    }

    loadSong();
  }, [id, isEditing, navigate]);

  /*
    |--------------------------------------------------------------------------
    | Add slide
    |--------------------------------------------------------------------------
    */

  function addSlide() {
    setSlides((previous) => [
      ...previous,

      {
        slide_type: "verse",
        content: "",
      },
    ]);
  }

  /*
    |--------------------------------------------------------------------------
    | Update slide
    |--------------------------------------------------------------------------
    */

  function updateSlide(index, field, value) {
    setSlides((previous) => {
      const copy = [...previous];

      copy[index] = {
        ...copy[index],

        [field]: value,
      };

      return copy;
    });
  }

  /*
    |--------------------------------------------------------------------------
    | Remove slide
    |--------------------------------------------------------------------------
    */

  function removeSlide(index) {
    setSlides((previous) => previous.filter((_, i) => i !== index));
  }

  /*
    |--------------------------------------------------------------------------
    | Save
    |--------------------------------------------------------------------------
    */

  async function saveSong(event) {
    event.preventDefault();

    if (!title.trim()) {
      alert("Song title is required.");

      return;
    }

    const validSlides = slides.filter((slide) => slide.content.trim());

    if (validSlides.length === 0) {
      alert("Please add at least one lyric slide.");

      return;
    }

    try {
      setSaving(true);

      const songData = {
        title: title.trim(),

        artist: artist.trim(),

        category: category.trim(),

        language: "English",

        slides: validSlides,
      };

      if (isEditing) {
        await songAPI.update(
          Number(id),

          songData,
        );
      } else {
        await songAPI.create(songData);
      }

      navigate("/songs");
    } catch (error) {
      console.error("Failed to save song:", error);

      alert("Failed to save song. Check the console for details.");
    } finally {
      setSaving(false);
    }
  }

  /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

  if (loading) {
    return (
      <div className="application">
        <header className="topbar">
          <HomeButton />

          <h1>Edit Song</h1>
        </header>

        <main className="editor-page">
          <p>Loading song...</p>
        </main>
      </div>
    );
  }

  /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

  return (
    <div className="application">
      <header className="topbar">
        <HomeButton />

        <h1>{isEditing ? "Edit Song" : "Add Song"}</h1>
      </header>

      <main className="editor-page">
        <form onSubmit={saveSong}>
          <label>
            Song title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </label>

          <label>
            Artist
            <input
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
            />
          </label>

          <label>
            Category
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
          </label>

          <h2>Lyrics Slides</h2>

          {slides.map((slide, index) => (
            <div className="slide-editor" key={index}>
              <div>
                <strong>Slide {index + 1}</strong>
              </div>

              <select
                value={slide.slide_type}
                onChange={(event) =>
                  updateSlide(index, "slide_type", event.target.value)
                }
              >
                <option value="intro">Intro</option>

                <option value="verse">Verse</option>

                <option value="chorus">Chorus</option>

                <option value="bridge">Bridge</option>

                <option value="tag">Tag</option>

                <option value="outro">Outro</option>
              </select>

              <textarea
                rows="7"
                placeholder="Enter lyrics..."
                value={slide.content}
                onChange={(event) =>
                  updateSlide(index, "content", event.target.value)
                }
                required
              />

              <button type="button" onClick={() => removeSlide(index)}>
                Remove
              </button>
            </div>
          ))}

          <button type="button" onClick={addSlide}>
            + Add Slide
          </button>

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Save Song"}
          </button>
        </form>
      </main>
    </div>
  );
}
