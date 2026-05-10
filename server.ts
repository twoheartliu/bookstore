import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GIST_URL = 'https://gist.githubusercontent.com/twoheartliu/de948c91619fd8cb1c26e9b14b7dc100/raw';

interface Book {
  id: string;
  title: string;
  originalPrice: number;
  price: number;
  category: string;
  cover: string;
  status: 'available' | 'locked' | 'sold_out';
  claimedBy?: string;
  description: string;
  doubanUrl?: string;
  lockedUntil?: number;
}

let booksCache: Book[] = [];
let lastFetch = 0;

async function fetchBooksFromGist() {
  try {
    const response = await fetch(`${GIST_URL}?t=${Date.now()}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    
    booksCache = data.map((b: any) => ({
      ...b,
      id: String(b.id),
      status: b.status || 'available'
    }));
    lastFetch = Date.now();
  } catch (error) {
    console.error("Failed to fetch books from Gist:", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Seed books on startup
  await fetchBooksFromGist();

  // API Routes
  app.get("/api/books", async (req, res) => {
    // Refresh cache if empty or older than 1 hour (as a fallback, though we want server state to be sticky)
    if (booksCache.length === 0 || Date.now() - lastFetch > 3600000) {
      await fetchBooksFromGist();
    }

    // Clean up expired locks
    const now = Date.now();
    booksCache = booksCache.map(b => {
      if (b.status === 'locked' && b.lockedUntil && b.lockedUntil < now) {
        return { ...b, status: 'available', lockedUntil: undefined };
      }
      return b;
    });

    res.json(booksCache);
  });

  app.post("/api/lock", (req, res) => {
    const { bookIds } = req.body;
    if (!Array.isArray(bookIds)) {
      return res.status(400).json({ error: "Invalid bookIds" });
    }

    const now = Date.now();
    const conflictedBooks: string[] = [];

    // Verify all books are available
    bookIds.forEach(id => {
      const book = booksCache.find(b => b.id === String(id));
      if (!book) return;
      
      // Check if locked correctly (accounting for expiry)
      const isLocked = book.status === 'locked' && book.lockedUntil && book.lockedUntil > now;
      const isSold = book.status === 'sold_out';

      if (isLocked || isSold) {
        conflictedBooks.push(book.title);
      }
    });

    if (conflictedBooks.length > 0) {
      return res.status(409).json({ 
        error: "Conflict", 
        conflictedTitles: conflictedBooks 
      });
    }

    // Apply locks (5 minutes)
    const expiry = now + 5 * 60 * 1000;
    booksCache = booksCache.map(b => {
      if (bookIds.includes(b.id)) {
        return { ...b, status: 'locked', lockedUntil: expiry };
      }
      return b;
    });

    res.json({ success: true, message: "Books locked for 5 minutes" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
