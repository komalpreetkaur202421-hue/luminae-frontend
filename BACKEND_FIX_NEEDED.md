# Backend Fixes Required for Dashboard & Cover Images

## Issue 1: Dashboard Shows 0 Blogs (User's Blogs Not Recognized)

### What's Happening

- Frontend creates a blog and sends it with `author: userId` (now explicitly sent after the fix)
- The created blog exists in the database, but the dashboard filter cannot find it
- Dashboard uses: `blogs.filter(b => authorId(b) === user._id)` to find user's blogs

### Root Cause (Backend Issue)

The Express backend **is not properly storing or returning the `author` field** when:

1. Creating a blog (`POST /api/blogs`)
2. Fetching blogs (`GET /api/blogs`)

### What the Backend Should Do

**In the `createBlog` endpoint:**

```javascript
// Extract user ID from JWT token (middleware should set req.user)
const newBlog = {
  title,
  content,
  category,
  coverImage, // Important: store this too!
  theme,
  author: req.user._id, // Set author from authenticated user
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

**In the `getBlogs` endpoint:**

- When querying blogs, **populate the author field** with user details:

```javascript
// Use MongoDB populate if using Mongoose
db.Blog.find().populate("author", "_id name email username");
```

**In the `getBlog` endpoint (get single blog):**

- Same population needed

### Expected Response Format

```json
{
  "_id": "...",
  "title": "My Blog",
  "content": "...",
  "coverImage": "https://example.com/image.jpg",
  "author": {
    "_id": "user123",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "category": "Writing",
  "theme": "midnight-glass",
  "createdAt": "2026-07-13T..."
}
```

---

## Issue 2: Cover Images Not Displaying

### What's Happening

- Frontend sends `coverImage` URL in the blog creation request
- The image URL exists (user entered it), but doesn't display on blog pages
- `<img src={blog.coverImage} ... />` renders but image doesn't load

### Root Cause Options (Backend Issue)

**Option A:** The `coverImage` field is not being stored in the database
**Option B:** The `coverImage` is stored but not returned in the API response
**Option C:** The image URL has CORS issues (only if hosted externally)

### What the Backend Should Do

1. **Accept and store the `coverImage` field:**

```javascript
const newBlog = {
  // ... other fields
  coverImage: req.body.coverImage, // Store as-is
};
```

2. **Return it in all blog API responses:**
   - `GET /api/blogs` - include `coverImage` in each blog
   - `GET /api/blogs/:id` - include `coverImage`
   - `POST /api/blogs` - return `coverImage` in response

3. **If the image is hosted on an external CDN**, ensure it's CORS-enabled or accessible

### Example MongoDB Schema (if using Mongoose)

```javascript
const blogSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  coverImage: { type: String }, // URL string
  category: String,
  theme: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
```

---

## Frontend Changes Already Applied

✅ **create.tsx** - Now explicitly sends `author: user._id` when creating a blog
✅ **Blog display components** - Already properly check and display both `author` and `coverImage`

---

## Testing Checklist After Backend Fixes

1. Create a new blog with a cover image URL
2. Check the database that both `author` and `coverImage` are stored
3. Refresh the dashboard - "My Blogs" count should increase
4. Go to dashboard - your blog should appear under "My Blogs"
5. Click on the blog - cover image should display
6. Cover image should also show in the blog card on the blogs list page
