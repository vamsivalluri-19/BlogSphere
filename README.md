# BlogSphere 🚀

**BlogSphere** is a high-performance, full-stack blog platform built using the MERN stack (MongoDB, Express, React, Node.js) with Tailwind CSS v4, Framer Motion, and markdown rendering. It includes role-based dashboards, bookmarking, author follow feeds, nested comment discussions, and growth analytics charts.

---

## 🌟 Key Features

### 👤 Authentication & Profiles
*   **JWT Security:** Fully secured endpoints with HTTP cookies and bearer authorization.
*   **Roles & Moderation:** Split dashboards for normal **Users** (creating/editing own articles and deleting own comments) and **Admins** (deleting any inappropriate posts/comments, deleting users, viewing platform metrics).
*   **Profiles:** Custom bio, avatar support, and follow counts.

### ✍️ Content Creation
*   **Markdown Editor:** Write articles using standard markdown. Includes a live side-by-side or tabbed visual previewer.
*   **Media Uploads:** Multer-based local image upload engine for cover images.
*   **Bookmarking & Liking:** Save articles for later reading and express appreciation on posts.
*   **Author Follows:** Subscribe to individual authors and filter posts dynamically by author.

### 💬 Nested Discussion Threads
*   **Recursive Comments:** Threaded, unlimited-depth replies for rich post-level conversations.
*   **Moderation:** Inline delete and edit flags for authors and admins.

### 📊 Recharts Analytics
*   **Admin Statistics:** Beautiful visual graphs charting registered users, article growth, and comment volume trends over the last 6 months.

---

## 🛠️ Technology Stack

*   **Frontend:** React.js, Vite, React Router DOM, Tailwind CSS v4, Axios, Lucide Icons.
*   **Backend:** Node.js, Express.js, MongoDB (connected via Mongoose ORM), Multer.
*   **Libraries:** Framer Motion, Recharts.

---

## 📂 Project Structure

```text
blog-platform/
├── server/              # Express Backend API
│   ├── config/          # Database & environment configurations
│   ├── models/          # MongoDB Schemas (User, Post, Comment)
│   ├── controllers/     # Route handler logic controllers
│   ├── middleware/      # Auth & file upload filters
│   ├── routes/          # API route mappings
│   ├── uploads/         # Static storage folder for cover images
│   ├── seed.js          # DB seeding file for testing
│   └── server.js        # Server main entrypoint
├── client/              # React Frontend Client (Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI elements (BlogCard, Comments, etc.)
│   │   ├── pages/       # Page templates (Home, Auth, Dashboards)
│   │   ├── layouts/     # Sticky navigation bars and footers
│   │   ├── context/     # Auth and theme context providers
│   │   └── services/    # Base Axios API instances
│   └── index.css        # Tailwind v4 directives & glass theme configurations
```

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm
*   A MongoDB Atlas connection string (or local MongoDB database)

### Backend Configuration
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Create a `.env` file containing:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_signing_key
   NODE_ENV=development
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Seed mock database entries (optional but recommended for previewing):
   ```bash
   npm run seed
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Configuration
1. Navigate to the `client/` directory:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite developer server:
   ```bash
   npm run dev
   ```
4. Access the web app at `http://localhost:5173`.

---

## 🔑 Test Accounts (Seeded)

If you ran the seed script, you can log in immediately with the following credentials:

| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@blogsphere.com` | `password123` | Moderate platform items and view growth analytics charts. |
| **User 1** | `jane@blogsphere.com` | `password123` | Author of multiple seeded posts. Test editing, comments, and profile bio setup. |
| **User 2** | `john@blogsphere.com` | `password123` | Test follow lists, likes, and nested comment replies. |
