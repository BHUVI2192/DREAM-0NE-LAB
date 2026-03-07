-- Insert 5 sample books with episodes for testing

-- Book 1: The Midnight Library
INSERT INTO books (title, author, genre, language, blurb, tags, cover_url, is_published, is_special)
VALUES (
    'The Midnight Library',
    'Matt Haig',
    'Fiction',
    'English',
    'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices.',
    ARRAY['Philosophy', 'Self-Discovery', 'Magical Realism'],
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
    true,
    false
) RETURNING id;

-- Book 2: Atomic Habits
INSERT INTO books (title, author, genre, language, blurb, tags, cover_url, is_published, is_special)
VALUES (
    'Atomic Habits',
    'James Clear',
    'Self-Help',
    'English',
    'No matter your goals, Atomic Habits offers a proven framework for improving every day. James Clear reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.',
    ARRAY['Productivity', 'Self-Improvement', 'Psychology'],
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop',
    true,
    false
) RETURNING id;

-- Book 3: The Silent Patient
INSERT INTO books (title, author, genre, language, blurb, tags, cover_url, is_published, is_special)
VALUES (
    'The Silent Patient',
    'Alex Michaelides',
    'Mystery',
    'English',
    'Alicia Berenson''s life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house. One evening her husband returns home late from a fashion shoot, and Alicia shoots him five times in the face, and then never speaks another word.',
    ARRAY['Thriller', 'Psychological', 'Crime'],
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
    true,
    false
) RETURNING id;

-- Book 4: Sapiens
INSERT INTO books (title, author, genre, language, blurb, tags, cover_url, is_published, is_special)
VALUES (
    'Sapiens: A Brief History of Humankind',
    'Yuval Noah Harari',
    'Non-Fiction',
    'English',
    'From a renowned historian comes a groundbreaking narrative of humanity''s creation and evolution that explores the ways in which biology and history have defined us and enhanced our understanding of what it means to be "human."',
    ARRAY['History', 'Anthropology', 'Science'],
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop',
    true,
    false
) RETURNING id;

-- Book 5: The Psychology of Money
INSERT INTO books (title, author, genre, language, blurb, tags, cover_url, is_published, is_special)
VALUES (
    'The Psychology of Money',
    'Morgan Housel',
    'Non-Fiction',
    'English',
    'Doing well with money isn''t necessarily about what you know. It''s about how you behave. And behavior is hard to teach, even to really smart people. Money―investing, personal finance, and business decisions―is typically taught as a math-based field, where data and formulas tell us exactly what to do.',
    ARRAY['Finance', 'Psychology', 'Business'],
    'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=400&h=600&fit=crop',
    true,
    false
) RETURNING id;

-- Insert episodes for each book (6 episodes each, first 2 are free)

-- Episodes for Book 1: The Midnight Library
DO $$
DECLARE
    book_id_1 uuid;
BEGIN
    SELECT id INTO book_id_1 FROM books WHERE title = 'The Midnight Library' LIMIT 1;
    
    INSERT INTO episodes (book_id, title, description, episode_number, duration_seconds, is_free, audio_url)
    VALUES 
        (book_id_1, 'The Library Between Life and Death', 'Nora Seed discovers the mysterious Midnight Library', 1, 1620, true, 'https://example.com/audio/ml-ep1.mp3'),
        (book_id_1, 'The Book of Regrets', 'Exploring the infinite possibilities of different lives', 2, 1580, true, 'https://example.com/audio/ml-ep2.mp3'),
        (book_id_1, 'The Lives Not Lived', 'Nora experiences her alternate lives as a rock star', 3, 1720, false, 'https://example.com/audio/ml-ep3.mp3'),
        (book_id_1, 'Swimming with Seals', 'A life as a glaciologist in the Arctic', 4, 1650, false, 'https://example.com/audio/ml-ep4.mp3'),
        (book_id_1, 'The Perfect Life?', 'Finding meaning in the lives she never chose', 5, 1700, false, 'https://example.com/audio/ml-ep5.mp3'),
        (book_id_1, 'The Real Library', 'Nora makes her final choice', 6, 1800, false, 'https://example.com/audio/ml-ep6.mp3');
END $$;

-- Episodes for Book 2: Atomic Habits
DO $$
DECLARE
    book_id_2 uuid;
BEGIN
    SELECT id INTO book_id_2 FROM books WHERE title = 'Atomic Habits' LIMIT 1;
    
    INSERT INTO episodes (book_id, title, description, episode_number, duration_seconds, is_free, audio_url)
    VALUES 
        (book_id_2, 'The Fundamentals', 'Why tiny changes make a big difference', 1, 1440, true, 'https://example.com/audio/ah-ep1.mp3'),
        (book_id_2, 'The Four Laws of Behavior Change', 'How your habits shape your identity', 2, 1520, true, 'https://example.com/audio/ah-ep2.mp3'),
        (book_id_2, 'Make It Obvious', 'The 1st Law: Implementation intentions and habit stacking', 3, 1600, false, 'https://example.com/audio/ah-ep3.mp3'),
        (book_id_2, 'Make It Attractive', 'The 2nd Law: Temptation bundling and motivation', 4, 1560, false, 'https://example.com/audio/ah-ep4.mp3'),
        (book_id_2, 'Make It Easy', 'The 3rd Law: The two-minute rule and friction', 5, 1580, false, 'https://example.com/audio/ah-ep5.mp3'),
        (book_id_2, 'Make It Satisfying', 'The 4th Law: Immediate rewards and habit tracking', 6, 1640, false, 'https://example.com/audio/ah-ep6.mp3');
END $$;

-- Episodes for Book 3: The Silent Patient
DO $$
DECLARE
    book_id_3 uuid;
BEGIN
    SELECT id INTO book_id_3 FROM books WHERE title = 'The Silent Patient' LIMIT 1;
    
    INSERT INTO episodes (book_id, title, description, episode_number, duration_seconds, is_free, audio_url)
    VALUES 
        (book_id_3, 'The Murder', 'Alicia Berenson shoots her husband and never speaks again', 1, 1500, true, 'https://example.com/audio/sp-ep1.mp3'),
        (book_id_3, 'The Therapist', 'Theo Faber becomes obsessed with treating Alicia', 2, 1480, true, 'https://example.com/audio/sp-ep2.mp3'),
        (book_id_3, 'The Sessions Begin', 'Theo starts therapy with the silent patient', 3, 1620, false, 'https://example.com/audio/sp-ep3.mp3'),
        (book_id_3, 'Uncovering the Past', 'Dark secrets from Alicia''s childhood emerge', 4, 1580, false, 'https://example.com/audio/sp-ep4.mp3'),
        (book_id_3, 'The Diary', 'Alicia''s diary reveals shocking truths', 5, 1700, false, 'https://example.com/audio/sp-ep5.mp3'),
        (book_id_3, 'The Truth', 'The stunning revelation behind the silence', 6, 1750, false, 'https://example.com/audio/sp-ep6.mp3');
END $$;

-- Episodes for Book 4: Sapiens
DO $$
DECLARE
    book_id_4 uuid;
BEGIN
    SELECT id INTO book_id_4 FROM books WHERE title LIKE 'Sapiens%' LIMIT 1;
    
    INSERT INTO episodes (book_id, title, description, episode_number, duration_seconds, is_free, audio_url)
    VALUES 
        (book_id_4, 'The Cognitive Revolution', 'How Homo sapiens conquered the world', 1, 1800, true, 'https://example.com/audio/sap-ep1.mp3'),
        (book_id_4, 'The Agricultural Revolution', 'History''s biggest fraud', 2, 1720, true, 'https://example.com/audio/sap-ep2.mp3'),
        (book_id_4, 'The Unification of Humankind', 'Money, empires, and universal religions', 3, 1680, false, 'https://example.com/audio/sap-ep3.mp3'),
        (book_id_4, 'The Scientific Revolution', 'The discovery of ignorance', 4, 1750, false, 'https://example.com/audio/sap-ep4.mp3'),
        (book_id_4, 'The Industrial Revolution', 'The marriage of science and capitalism', 5, 1820, false, 'https://example.com/audio/sap-ep5.mp3'),
        (book_id_4, 'The Future of Sapiens', 'The end of Homo sapiens?', 6, 1900, false, 'https://example.com/audio/sap-ep6.mp3');
END $$;

-- Episodes for Book 5: The Psychology of Money
DO $$
DECLARE
    book_id_5 uuid;
BEGIN
    SELECT id INTO book_id_5 FROM books WHERE title = 'The Psychology of Money' LIMIT 1;
    
    INSERT INTO episodes (book_id, title, description, episode_number, duration_seconds, is_free, audio_url)
    VALUES 
        (book_id_5, 'No One''s Crazy', 'How your personal experiences shape your financial decisions', 1, 1380, true, 'https://example.com/audio/pom-ep1.mp3'),
        (book_id_5, 'Luck vs Risk', 'Understanding the role of chance in success', 2, 1420, true, 'https://example.com/audio/pom-ep2.mp3'),
        (book_id_5, 'Never Enough', 'The danger of always wanting more', 3, 1460, false, 'https://example.com/audio/pom-ep3.mp3'),
        (book_id_5, 'Compounding Magic', 'The eighth wonder of the world', 4, 1500, false, 'https://example.com/audio/pom-ep4.mp3'),
        (book_id_5, 'Wealth is What You Don''t See', 'The difference between rich and wealthy', 5, 1440, false, 'https://example.com/audio/pom-ep5.mp3'),
        (book_id_5, 'Room for Error', 'The most important part of every plan', 6, 1520, false, 'https://example.com/audio/pom-ep6.mp3');
END $$;
