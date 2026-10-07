require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const DATA_FILE = path.join(__dirname, 'data.json');

// --- CORS Configuration ---
const rawOrigins = process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000';
const allowedOrigins = rawOrigins.split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parser
app.use(express.json());

// --- Request Logger Middleware ---
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// --- JSON File Storage Helpers (Bonus 3) ---
async function readData() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await writeData([]);
      return [];
    }
    console.error('Error reading data.json:', err);
    throw err;
  }
}

async function writeData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing data.json:', err);
    throw err;
  }
}

// --- Health Check Endpoints for Botkeep Cloud ---
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Fullstack Blog API (Lab 3)',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime()
  });
});

// --- STORY / POST ROUTES ---

// 1. GET /api/posts — Retrieve stories list
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await readData();
    const formatted = posts.map(p => ({
      ...p,
      comments: p.comments || [],
      commentsCount: (p.comments || []).length
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Unable to retrieve stories' });
  }
});

// 2. GET /api/posts/:id — Retrieve single story details (Bonus 4)
app.get('/api/posts/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const posts = await readData();
    const post = posts.find(p => p.id === id);

    if (!post) {
      return res.status(404).json({ error: 'Story not found' });
    }

    res.json({
      ...post,
      comments: post.comments || [],
      commentsCount: (post.comments || []).length
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching story details' });
  }
});

// 3. POST /api/posts — Create new story
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, author, category, imageUrl } = req.body;

    if (!title || !content || !author) {
      return res.status(400).json({ error: 'Missing required fields: title, content, and author are required' });
    }

    const posts = await readData();
    const newPost = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      author: author.trim(),
      category: category ? category.trim() : 'Design Journal',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      createdAt: new Date().toISOString(),
      comments: []
    };

    posts.unshift(newPost);
    await writeData(posts);

    res.status(201).json({
      ...newPost,
      commentsCount: 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Unable to create story' });
  }
});

// 4. PUT /api/posts/:id — Update existing story (Bonus 1)
app.put('/api/posts/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, content, author, category, imageUrl } = req.body;

    const posts = await readData();
    const index = posts.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Story not found' });
    }

    posts[index] = {
      ...posts[index],
      title: title !== undefined ? title.trim() : posts[index].title,
      content: content !== undefined ? content.trim() : posts[index].content,
      author: author !== undefined ? author.trim() : posts[index].author,
      category: category !== undefined ? category.trim() : posts[index].category,
      imageUrl: imageUrl !== undefined ? imageUrl : posts[index].imageUrl,
      updatedAt: new Date().toISOString()
    };

    await writeData(posts);

    res.json({
      ...posts[index],
      commentsCount: (posts[index].comments || []).length
    });
  } catch (err) {
    res.status(500).json({ error: 'Unable to update story' });
  }
});

// 5. DELETE /api/posts/:id — Delete story
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const posts = await readData();
    const index = posts.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Story not found' });
    }

    posts.splice(index, 1);
    await writeData(posts);

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Unable to delete story' });
  }
});

// --- COMMENTS ROUTES (Bonus 4) ---

// 6. POST /api/posts/:id/comments — Add comment to story
app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const { author, content } = req.body;

    if (!author || !content) {
      return res.status(400).json({ error: 'Author and comment content cannot be empty' });
    }

    const posts = await readData();
    const post = posts.find(p => p.id === postId);

    if (!post) {
      return res.status(404).json({ error: 'Story not found for commenting' });
    }

    if (!post.comments) {
      post.comments = [];
    }

    const newComment = {
      id: Date.now(),
      author: author.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    post.comments.push(newComment);
    await writeData(posts);

    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: 'Unable to post comment' });
  }
});

// 7. GET /api/posts/:id/comments — Get comments list
app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const posts = await readData();
    const post = posts.find(p => p.id === postId);

    if (!post) {
      return res.status(404).json({ error: 'Story not found' });
    }

    res.json(post.comments || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error while retrieving comments' });
  }
});

// 8. DELETE /api/comments/:commentId — Delete comment
app.delete('/api/comments/:commentId', async (req, res) => {
  try {
    const commentId = Number(req.params.commentId);
    const posts = await readData();

    let found = false;
    for (const post of posts) {
      if (post.comments && post.comments.length > 0) {
        const cIndex = post.comments.findIndex(c => c.id === commentId);
        if (cIndex !== -1) {
          post.comments.splice(cIndex, 1);
          found = true;
          break;
        }
      }
    }

    if (!found) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    await writeData(posts);
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Unable to delete comment' });
  }
});

// --- Server Listen ---
const PORT = process.env.SERVER_PORT || process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port :${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});
