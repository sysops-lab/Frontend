const { pool } = require("../database/connection.cjs");

async function getSongs(search = "") {
  const [rows] = await pool.execute(
    `
            SELECT
                id,
                title,
                artist,
                category,
                language,
                created_at,
                updated_at
            FROM songs
            WHERE
                title LIKE ?
                OR artist LIKE ?
                OR category LIKE ?
            ORDER BY title ASC
            `,
    [`%${search}%`, `%${search}%`, `%${search}%`],
  );

  return rows;
}

async function getSong(id) {
  const [songs] = await pool.execute(
    `
            SELECT *
            FROM songs
            WHERE id = ?
            `,
    [id],
  );

  if (songs.length === 0) {
    return null;
  }

  const [slides] = await pool.execute(
    `
            SELECT *
            FROM slides
            WHERE song_id = ?
            ORDER BY slide_order ASC
            `,
    [id],
  );

  return {
    ...songs[0],

    slides,
  };
}

async function createSong(song) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `
                INSERT INTO songs
                (
                    title,
                    artist,
                    category,
                    language
                )
                VALUES (?, ?, ?, ?)
                `,
      [
        song.title,
        song.artist || null,
        song.category || null,
        song.language || "English",
      ],
    );

    const songId = result.insertId;

    const slides = Array.isArray(song.slides) ? song.slides : [];

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];

      await connection.execute(
        `
                INSERT INTO slides
                (
                    song_id,
                    slide_order,
                    slide_type,
                    content
                )
                VALUES (?, ?, ?, ?)
                `,
        [songId, i + 1, slide.slide_type || "verse", slide.content || ""],
      );
    }

    await connection.commit();

    return await getSong(songId);
  } catch (error) {
    await connection.rollback();

    throw error;
  } finally {
    connection.release();
  }
}

async function updateSong(id, song) {
  if (!id) {
    throw new Error("Song ID is required.");
  }

  if (!song) {
    throw new Error("Song data is required.");
  }

  if (!song.title || !song.title.trim()) {
    throw new Error("Song title is required.");
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    /*
        --------------------------------------------------
        Check that the song exists
        --------------------------------------------------
        */

    const [existing] = await connection.execute(
      `
                SELECT id
                FROM songs
                WHERE id = ?
                `,
      [id],
    );

    if (existing.length === 0) {
      throw new Error(`Song with ID ${id} was not found.`);
    }

    /*
        --------------------------------------------------
        Update song information
        --------------------------------------------------
        */

    await connection.execute(
      `
            UPDATE songs

            SET
                title = ?,
                artist = ?,
                category = ?,
                language = ?

            WHERE id = ?
            `,
      [
        song.title.trim(),

        song.artist ? song.artist.trim() : null,

        song.category ? song.category.trim() : null,

        song.language || "English",

        id,
      ],
    );

    /*
        --------------------------------------------------
        Delete old slides
        --------------------------------------------------
        */

    await connection.execute(
      `
            DELETE FROM slides
            WHERE song_id = ?
            `,
      [id],
    );

    /*
        --------------------------------------------------
        Insert updated slides
        --------------------------------------------------
        */

    const slides = Array.isArray(song.slides) ? song.slides : [];

    let slideOrder = 1;

    for (const slide of slides) {
      if (!slide || !slide.content || !slide.content.trim()) {
        continue;
      }

      await connection.execute(
        `
                INSERT INTO slides
                (
                    song_id,
                    slide_order,
                    slide_type,
                    content
                )
                VALUES (?, ?, ?, ?)
                `,
        [id, slideOrder, slide.slide_type || "verse", slide.content.trim()],
      );

      slideOrder++;
    }

    /*
        --------------------------------------------------
        Commit everything
        --------------------------------------------------
        */

    await connection.commit();

    /*
        --------------------------------------------------
        Return updated song
        --------------------------------------------------
        */

    return await getSong(id);
  } catch (error) {
    await connection.rollback();

    throw error;
  } finally {
    connection.release();
  }
}

async function deleteSong(id) {
  await pool.execute(
    `
        DELETE FROM songs
        WHERE id = ?
        `,
    [id],
  );

  return true;
}

module.exports = {
  getSongs,

  getSong,

  createSong,

  updateSong,

  deleteSong,
};
