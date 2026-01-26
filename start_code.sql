-- ==========================================
-- 0. ÅTERSTÄLL DATABAS
-- ==========================================
DROP VIEW IF EXISTS ActiveLoansView;
DROP TABLE IF EXISTS Reservations;
DROP TABLE IF EXISTS Loans;
DROP TABLE IF EXISTS Borrowers;
DROP TABLE IF EXISTS Book_Genre;
DROP TABLE IF EXISTS Book;
DROP TABLE IF EXISTS Genre;
DROP TABLE IF EXISTS Author;

-- ==========================================
-- 1. SKAPA TABELLER (Med alla Constraints)
-- ==========================================

CREATE TABLE Author (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    year_of_birth INTEGER -- För Uppgift 4/Sequelize
);

CREATE TABLE Genre (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Book (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 10.00 CHECK (price >= 10.00), -- Uppgift 1
    stock INTEGER DEFAULT 5 CHECK (stock >= 0),
    author_id INTEGER REFERENCES Author(id) ON DELETE CASCADE
);

CREATE TABLE Book_Genre (
    book_id INTEGER REFERENCES Book(id) ON DELETE CASCADE,
    genre_id INTEGER REFERENCES Genre(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, genre_id)
);

CREATE TABLE Borrowers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL CHECK (email LIKE '%@%') -- Uppgift 1
);

CREATE TABLE Loans (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES Book(id) ON DELETE CASCADE,
    borrower_id INTEGER REFERENCES Borrowers(id) ON DELETE CASCADE,
    loan_date DATE NOT NULL DEFAULT CURRENT_DATE CHECK (loan_date <= CURRENT_DATE), -- Uppgift 2
    return_date DATE DEFAULT NULL,
    CONSTRAINT chk_return_date CHECK (return_date IS NULL OR return_date >= loan_date), -- Uppgift 2
    CONSTRAINT uq_single_loan_per_day UNIQUE (book_id, borrower_id, loan_date) -- Uppgift 3
);

CREATE TABLE Reservations (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES Book(id) ON DELETE CASCADE,
    borrower_id INTEGER REFERENCES Borrowers(id) ON DELETE CASCADE,
    reservation_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'AKTIV' CHECK (status IN ('AKTIV', 'AVSLUTAD')),
    UNIQUE(book_id, borrower_id, status) -- Uppgift 8
);

-- ==========================================
-- 2. FUNKTIONER & TRIGGERS
-- ==========================================

CREATE OR REPLACE FUNCTION fn_calculate_debt(borrower_id_param INT)
RETURNS NUMERIC AS $$
BEGIN
    RETURN (SELECT COALESCE(SUM(CASE 
        WHEN (CURRENT_DATE - loan_date) > 30 THEN ((CURRENT_DATE - loan_date) - 30) * 10
        ELSE 0 
    END), 0) FROM Loans WHERE borrower_id = borrower_id_param AND return_date IS NULL);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_active_loans_count(borrower_id_param INT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM Loans WHERE borrower_id = borrower_id_param AND return_date IS NULL);
END;
$$ LANGUAGE plpgsql;

-- Trigger: Minska lager (Uppgift 6)
CREATE OR REPLACE FUNCTION trg_decrease_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT stock FROM Book WHERE id = NEW.book_id) <= 0 THEN
        RAISE EXCEPTION 'Boken är slut i lager.';
    END IF;
    UPDATE Book SET stock = stock - 1 WHERE id = NEW.book_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_loan_insert BEFORE INSERT ON Loans
FOR EACH ROW EXECUTE FUNCTION trg_decrease_stock();

-- Trigger: Öka lager (Uppgift 7)
CREATE OR REPLACE FUNCTION trg_increase_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.return_date IS NULL AND NEW.return_date IS NOT NULL THEN
        UPDATE Book SET stock = stock + 1 WHERE id = NEW.book_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_loan_return AFTER UPDATE ON Loans
FOR EACH ROW EXECUTE FUNCTION trg_increase_stock();

-- ==========================================
-- 3. SEEDA DATA (Återställd fullständig lista)
-- ==========================================

-- Författare (Nu med födelseår)
INSERT INTO Author (id, name, year_of_birth) VALUES
(1, 'Astrid Lindgren', 1907), (2, 'Fredrik Backman', 1981), (3, 'Karin Smirnoff', 1964),
(4, 'Håkan Nesser', 1950), (5, 'Alex Schulman', 1976), (6, 'Stephen King', 1947),
(7, 'J.K. Rowling', 1965), (8, 'George R.R. Martin', 1948), (9, 'Agatha Christie', 1890),
(10, 'Ernest Hemingway', 1899), (11, 'Haruki Murakami', 1949), (12, 'Tove Jansson', 1914),
(13, 'Vilhelm Moberg', 1898), (14, 'August Strindberg', 1849), (15, 'Camilla Läckberg', 1974);

-- Genrer
INSERT INTO Genre (id, name) VALUES
(1, 'Barnlitteratur'), (2, 'Drama'), (3, 'Kriminalroman'),
(4, 'Fantasy'), (5, 'Klassiker'), (6, 'Skräck'),
(7, 'Thriller'), (8, 'Historisk roman'), (9, 'Mysterium'),
(10, 'Magisk realism');

-- Böcker (Obs: Price måste vara >= 10.00 pga constraint)
INSERT INTO Book (id, name, price, stock, author_id) VALUES
(1, 'Pippi Långstrump', 149.00, 10, 1),
(2, 'Bröderna Lejonhjärta', 189.50, 5, 1),
(3, 'Ronja Rövardotter', 175.00, 7, 1),
(4, 'En man som heter Ove', 129.00, 3, 2),
(5, 'Björnstad', 210.00, 4, 2),
(6, 'The Shining', 155.00, 2, 6),
(7, 'It', 249.00, 5, 6),
(8, 'Pet Sematary', 145.00, 3, 6),
(9, 'Harry Potter och de vises sten', 299.00, 8, 7),
(10, 'A Game of Thrones', 320.00, 4, 8),
(11, 'Mordet på Orientexpressen', 99.00, 6, 9),
(12, 'Och så var de bara en', 115.00, 4, 9),
(13, 'Den gamle och havet', 85.00, 3, 10),
(14, 'Norwegian Wood', 160.00, 2, 11),
(15, 'Kafka på stranden', 195.00, 3, 11),
(16, 'Isprinsessan', 199.00, 5, 15),
(17, 'Överlevarna', 185.00, 4, 5);

-- Kopplingar Bok <-> Genre
INSERT INTO Book_Genre (book_id, genre_id) VALUES
(1, 1), (1, 5), (2, 1), (2, 4), (3, 1), (4, 2), (5, 2), (6, 6), (7, 6), (9, 4), (10, 4), (11, 3), (11, 9), (13, 5), (14, 2), (15, 10), (16, 3), (17, 2);

-- Låntagare
INSERT INTO Borrowers (id, name, email) VALUES
(1, 'Alice Johnson', 'alice@example.com'),
(2, 'Bob Smith', 'bob@example.com'),
(3, 'Charlie Brown', 'charlie@example.com'),
(4, 'Grace Hopper', 'grace@example.com'),
(5, 'Alan Turing', 'alan@example.com'),
(6, 'Ada Lovelace', 'ada@example.com'),
(7, 'Margaret Hamilton', 'margaret@nasa.gov'),
(8, 'Linus Torvalds', 'linus@linux.org');

-- Lån
-- Notera: Dessa lån kommer att trigga lager-minskning via 'trigger_loan_insert'
INSERT INTO Loans (book_id, borrower_id, loan_date, return_date) VALUES
(1, 1, CURRENT_DATE - INTERVAL '10 days', NULL),
(9, 2, CURRENT_DATE - INTERVAL '5 days', NULL),
(11, 5, CURRENT_DATE - INTERVAL '15 days', NULL),
(4, 8, CURRENT_DATE - INTERVAL '2 days', NULL),
(16, 7, CURRENT_DATE - INTERVAL '20 days', NULL),
(5, 3, CURRENT_DATE - INTERVAL '45 days', NULL),
(10, 4, CURRENT_DATE - INTERVAL '65 days', NULL),
(15, 6, CURRENT_DATE - INTERVAL '31 days', NULL),
(7, 7, CURRENT_DATE - INTERVAL '90 days', NULL),
(14, 1, CURRENT_DATE - INTERVAL '35 days', NULL);

-- Återlämnade lån (Triggar lager-ökning)
INSERT INTO Loans (book_id, borrower_id, loan_date, return_date) VALUES
(2, 1, CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE - INTERVAL '5 days'),
(13, 8, CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '2 days');

-- ==========================================
-- 4. VY & SYNKRONISERING
-- ==========================================

CREATE OR REPLACE VIEW ActiveLoansView AS
SELECT 
    br.name AS borrower_name,
    b.name AS book_title,
    l.loan_date,
    (CURRENT_DATE - l.loan_date) AS days_out,
    CASE WHEN (CURRENT_DATE - l.loan_date) > 30 THEN 'FORSENAD' ELSE 'AKTIV' END AS status,
    fn_calculate_debt(br.id) AS total_debt_sek
FROM Loans l
JOIN Borrowers br ON l.borrower_id = br.id
JOIN Book b ON l.book_id = b.id
WHERE l.return_date IS NULL;

SELECT setval(pg_get_serial_sequence('Author', 'id'), (SELECT MAX(id) FROM Author));
SELECT setval(pg_get_serial_sequence('Book', 'id'), (SELECT MAX(id) FROM Book));
SELECT setval(pg_get_serial_sequence('Genre', 'id'), (SELECT MAX(id) FROM Genre));
SELECT setval(pg_get_serial_sequence('Borrowers', 'id'), (SELECT MAX(id) FROM Borrowers));
SELECT setval(pg_get_serial_sequence('Loans', 'id'), (SELECT MAX(id) FROM Loans));

-- Slutkontroll
SELECT * FROM ActiveLoansView;