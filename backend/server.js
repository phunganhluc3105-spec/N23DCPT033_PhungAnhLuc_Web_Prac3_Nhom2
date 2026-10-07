require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');

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

// --- Mongoose Schemas & Model ---
const commentSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  author: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { _id: false });

const postSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, default: 'Design Journal' },
  imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String },
  comments: { type: [commentSchema], default: [] }
}, {
  versionKey: false
});

const PostModel = mongoose.model('Post', postSchema);

// Format helper
function formatPost(p) {
  if (!p) return null;
  const post = typeof p.toObject === 'function' ? p.toObject() : { ...p };
  delete post._id;
  return {
    ...post,
    comments: post.comments || [],
    commentsCount: (post.comments || []).length
  };
}

// --- JSON File Storage Helpers (Fallback / Bonus 3) ---
async function readDataFromFile() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await writeDataToFile([]);
      return [];
    }
    console.error('Error reading data.json:', err);
    throw err;
  }
}

async function writeDataToFile(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing data.json:', err);
    throw err;
  }
}

// --- Dual Mode Storage Adapter ---
let isMongoConnected = false;

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
      isMongoConnected = true;
      console.log('✅ Connected to MongoDB Atlas successfully');

      // Auto-migrate data from data.json if database collection is empty
      try {
        const count = await PostModel.countDocuments();
        if (count === 0) {
          const filePosts = await readDataFromFile();
          if (Array.isArray(filePosts) && filePosts.length > 0) {
            await PostModel.insertMany(filePosts);
            console.log(`✅ Seeded ${filePosts.length} posts from data.json into MongoDB Atlas`);
          }
        }
      } catch (seedErr) {
        console.warn('⚠️ Seed check error:', seedErr.message);
      }
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
      console.log('⚠️ Falling back to local data.json storage');
    });
} else {
  console.log('ℹ️ No MONGODB_URI found. Running with local data.json storage');
}

// --- Health Check Endpoints ---
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Fullstack Blog API (Lab 3)',
    version: '1.1.0',
    storage: isMongoConnected ? 'MongoDB Atlas' : 'Local JSON File',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    storage: isMongoConnected ? 'mongodb' : 'json_file',
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
    if (isMongoConnected) {
      const posts = await PostModel.find().sort({ createdAt: -1 }).lean();
      return res.json(posts.map(formatPost));
    }
    const posts = await readDataFromFile();
    res.json(posts.map(formatPost));
  } catch (err) {
    console.error('Error retrieving posts:', err);
    res.status(500).json({ error: 'Unable to retrieve stories' });
  }
});

// 2. GET /api/posts/:id — Retrieve single story details (Bonus 4)
app.get('/api/posts/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isMongoConnected) {
      const post = await PostModel.findOne({ id }).lean();
      if (!post) {
        return res.status(404).json({ error: 'Story not found' });
      }
      return res.json(formatPost(post));
    }

    const posts = await readDataFromFile();
    const post = posts.find(p => p.id === id);
    if (!post) {
      return res.status(404).json({ error: 'Story not found' });
    }
    res.json(formatPost(post));
  } catch (err) {
    console.error('Error fetching post:', err);
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

    if (isMongoConnected) {
      await PostModel.create(newPost);
      return res.status(201).json({
        ...newPost,
        commentsCount: 0
      });
    }

    const posts = await readDataFromFile();
    posts.unshift(newPost);
    await writeDataToFile(posts);

    res.status(201).json({
      ...newPost,
      commentsCount: 0
    });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Unable to create story' });
  }
});

// 4. PUT /api/posts/:id — Update existing story (Bonus 1)
app.put('/api/posts/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, content, author, category, imageUrl } = req.body;

    if (isMongoConnected) {
      const updateFields = {
        updatedAt: new Date().toISOString()
      };
      if (title !== undefined) updateFields.title = title.trim();
      if (content !== undefined) updateFields.content = content.trim();
      if (author !== undefined) updateFields.author = author.trim();
      if (category !== undefined) updateFields.category = category.trim();
      if (imageUrl !== undefined) updateFields.imageUrl = imageUrl;

      const updated = await PostModel.findOneAndUpdate(
        { id },
        { $set: updateFields },
        { new: true }
      ).lean();

      if (!updated) {
        return res.status(404).json({ error: 'Story not found' });
      }

      return res.json(formatPost(updated));
    }

    const posts = await readDataFromFile();
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

    await writeDataToFile(posts);

    res.json(formatPost(posts[index]));
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ error: 'Unable to update story' });
  }
});

// 5. DELETE /api/posts/:id — Delete story
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isMongoConnected) {
      const result = await PostModel.deleteOne({ id });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Story not found' });
      }
      return res.json({ message: 'Deleted successfully' });
    }

    const posts = await readDataFromFile();
    const index = posts.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Story not found' });
    }

    posts.splice(index, 1);
    await writeDataToFile(posts);

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
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

    const newComment = {
      id: Date.now(),
      author: author.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    if (isMongoConnected) {
      const updated = await PostModel.findOneAndUpdate(
        { id: postId },
        { $push: { comments: newComment } },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ error: 'Story not found for commenting' });
      }

      return res.status(201).json(newComment);
    }

    const posts = await readDataFromFile();
    const post = posts.find(p => p.id === postId);

    if (!post) {
      return res.status(404).json({ error: 'Story not found for commenting' });
    }

    if (!post.comments) {
      post.comments = [];
    }

    post.comments.push(newComment);
    await writeDataToFile(posts);

    res.status(201).json(newComment);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Unable to post comment' });
  }
});

// 7. GET /api/posts/:id/comments — Get comments list
app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const postId = Number(req.params.id);

    if (isMongoConnected) {
      const post = await PostModel.findOne({ id: postId }, { comments: 1 }).lean();
      if (!post) {
        return res.status(404).json({ error: 'Story not found' });
      }
      return res.json(post.comments || []);
    }

    const posts = await readDataFromFile();
    const post = posts.find(p => p.id === postId);

    if (!post) {
      return res.status(404).json({ error: 'Story not found' });
    }

    res.json(post.comments || []);
  } catch (err) {
    console.error('Error retrieving comments:', err);
    res.status(500).json({ error: 'Server error while retrieving comments' });
  }
});

// 8. DELETE /api/comments/:commentId — Delete comment
app.delete('/api/comments/:commentId', async (req, res) => {
  try {
    const commentId = Number(req.params.commentId);

    if (isMongoConnected) {
      const result = await PostModel.updateOne(
        { 'comments.id': commentId },
        { $pull: { comments: { id: commentId } } }
      );

      if (result.matchedCount === 0 || result.modifiedCount === 0) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      return res.json({ message: 'Comment deleted successfully' });
    }

    const posts = await readDataFromFile();
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

    await writeDataToFile(posts);
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Unable to delete comment' });
  }
});

// --- Server Listen ---
const PORT = process.env.SERVER_PORT || process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port :${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});
