CREATE DATABASE IF NOT EXISTS church_song_display
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE church_song_display;

CREATE TABLE IF NOT EXISTS songs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(255) NOT NULL,

    artist VARCHAR(255),

    category VARCHAR(100),

    language VARCHAR(50)
        DEFAULT 'English',

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_song_title (title),

    INDEX idx_song_artist (artist)
);


CREATE TABLE IF NOT EXISTS slides (

    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    song_id INT UNSIGNED NOT NULL,

    slide_order INT NOT NULL,

    slide_type ENUM(
        'intro',
        'verse',
        'chorus',
        'bridge',
        'tag',
        'outro',
        'custom'
    ) DEFAULT 'verse',

    content TEXT NOT NULL,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (song_id)
        REFERENCES songs(id)
        ON DELETE CASCADE,

    INDEX idx_song_slides (
        song_id,
        slide_order
    )
);


CREATE TABLE IF NOT EXISTS playlists (

    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(255) NOT NULL,

    service_date DATE,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS playlist_items (

    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    playlist_id INT UNSIGNED NOT NULL,

    song_id INT UNSIGNED NOT NULL,

    item_order INT NOT NULL,

    FOREIGN KEY (playlist_id)
        REFERENCES playlists(id)
        ON DELETE CASCADE,

    FOREIGN KEY (song_id)
        REFERENCES songs(id)
        ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS settings (

    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    setting_key VARCHAR(100) NOT NULL UNIQUE,

    setting_value TEXT
);
