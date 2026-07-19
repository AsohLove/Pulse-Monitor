INSERT INTO monitors (name, url, interval_seconds, expected_status, is_active, owner_id)
VALUES 
    ('Google Search', 'https://www.google.com', 10, 200, true, 1),
    ('GitHub Platform', 'https://github.com', 30, 200, true, 1),
    ('YouTube Homepage', 'https://www.youtube.com', 120, 200, true, 1),
    ('Wikipedia Main', 'https://www.wikipedia.org', 300, 200, true, 2),
    ('Reddit Mobile API', 'https://www.reddit.com', 60, 200, false, 2);