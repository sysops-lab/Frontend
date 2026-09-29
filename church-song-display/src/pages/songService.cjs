const { db } = require("../database/connection.cjs");

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function getSlides(songId) {
  return db
    .prepare(
      `
        SELECT
            id,
            song_id,
            slide_type,
            content
        FROM slides
        WHERE song_id = ?
        ORDER BY id ASC
    `,
    )
    .all(songId);
}

function attachSlides(song) {
  if (!song) {
    return null;
  }

  return {
    ...song,

    slides: getSlides(song.id),
  };
}

/*
|--------------------------------------------------------------------------
| Get songs
|--------------------------------------------------------------------------
|
| Used by the Song Library.
| Returns basic song information.
|
*/

function getSongs(search = "") {
  const query = `
        SELECT
            id,
            title,
            artist,
            category,
            language
        FROM songs
        WHERE
            title LIKE ?
            OR artist LIKE ?
            OR category LIKE ?
        ORDER BY title ASC
    `;

  const term = `%${search}%`;

  return db.prepare(query).all(term, term, term);
}

/*
|--------------------------------------------------------------------------
| Get one complete song
|--------------------------------------------------------------------------
|
| Returns the song together with its slides.
|
*/

function getSong(id) {
  const song = db
    .prepare(
      `
            SELECT
                id,
                title,
                artist,
                category,
                language
            FROM songs
            WHERE id = ?
        `,
    )
    .get(id);

  if (!song) {
    return null;
  }

  return attachSlides(song);
}

/*
|--------------------------------------------------------------------------
| Create song
|--------------------------------------------------------------------------
*/

function createSong(song) {
  if (!song) {
    throw new Error("Song data is required.");
  }

  if (!song.title || !song.title.trim()) {
    throw new Error("Song title is required.");
  }

  const insertSong = db.prepare(`
            INSERT INTO songs (
                title,
                artist,
                category,
                language
            )
            VALUES (?, ?, ?, ?)
        `);

  const insertSlide = db.prepare(`
            INSERT INTO slides (
                song_id,
                slide_type,
                content
            )
            VALUES (?, ?, ?)
        `);

  const transaction = db.transaction(() => {
    const result = insertSong.run(
      song.title.trim(),
      song.artist || "",
      song.category || "",
      song.language || "English",
    );

    const songId = result.lastInsertRowid;

    const slides = Array.isArray(song.slides) ? song.slides : [];

    for (const slide of slides) {
      if (!slide) {
        continue;
      }

      insertSlide.run(
        songId,

        slide.slide_type || "verse",

        slide.content || "",
      );
    }

    return songId;
  });

  return getSong(transaction);
}

/*
|--------------------------------------------------------------------------
| Delete song
|--------------------------------------------------------------------------
*/

function deleteSong(id) {
  const deleteSlides = db.prepare(`
            DELETE FROM slides
            WHERE song_id = ?
        `);

  const deleteSong = db.prepare(`
            DELETE FROM songs
            WHERE id = ?
        `);

  const transaction = db.transaction(() => {
    deleteSlides.run(id);

    return deleteSong.run(id);
  });

  const result = transaction();

  return {
    success: result.changes > 0,
  };
} /*
|--------------------------------------------------------------------------
| Update song
|--------------------------------------------------------------------------
*/

function updateSong(id, song) {
  if (!id) {
    throw new Error("Song ID is required.");
  }

  if (!song) {
    throw new Error("Song data is required.");
  }

  if (!song.title || !song.title.trim()) {
    throw new Error("Song title is required.");
  }

  const updateSongQuery = db.prepare(`
            UPDATE songs
            SET
                title = ?,
                artist = ?,
                category = ?,
                language = ?
            WHERE id = ?
        `);

  const deleteSlides = db.prepare(`
            DELETE FROM slides
            WHERE song_id = ?
        `);

  const insertSlide = db.prepare(`
            INSERT INTO slides (
                song_id,
                slide_type,
                content
            )
            VALUES (?, ?, ?)
        `);

  const transaction = db.transaction(() => {
    const result = updateSongQuery.run(
      song.title.trim(),

      song.artist || "",

      song.category || "",

      song.language || "English",

      id,
    );

    if (result.changes === 0) {
      throw new Error(`Song with ID ${id} was not found.`);
    }

    /*
     * Remove the old slides.
     */

    deleteSlides.run(id);

    /*
     * Insert the new slides.
     */

    const slides = Array.isArray(song.slides) ? song.slides : [];

    for (const slide of slides) {
      if (!slide) {
        continue;
      }

      insertSlide.run(
        id,

        slide.slide_type || "verse",

        slide.content || "",
      );
    }
  });

  /*
   * Save everything as one transaction.
   */

  transaction();

  /*
   * Return the complete updated song,
   * including its slides.
   */

  return getSong(id);
}

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  getSongs,

  getSong,

  createSong,

  updateSong,

  deleteSong,
};
