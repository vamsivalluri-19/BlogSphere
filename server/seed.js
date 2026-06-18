require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    // Clear DB
    await User.deleteMany();
    await Post.deleteMany();
    await Comment.deleteMany();
    console.log('Cleared existing database records...');

    // Salt password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Users
    const adminUser = await User.create({
      name: 'Admin Moderator',
      email: 'admin@blogsphere.com',
      password: 'password123', // Will be hashed via User.js pre-save, but since we are bypassing or using direct creation: wait!
      // Actually, User.create triggers pre-save middleware, so we can just pass the plain password text!
      // Let's pass plain text to allow the User schema's pre-save hook to hash it correctly!
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=150&auto=format&fit=crop',
      role: 'admin',
      bio: 'Platform administrator and content moderator at BlogSphere.',
      isVerified: true,
    });

    const user1 = await User.create({
      name: 'Jane Doe',
      email: 'jane@blogsphere.com',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
      role: 'user',
      bio: 'Full stack engineer who loves blogging about frontend animations and CSS tricks.',
      isVerified: true,
    });

    const user2 = await User.create({
      name: 'John Smith',
      email: 'john@blogsphere.com',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
      role: 'user',
      bio: 'SaaS business strategist and startup enthusiast. Sharing case studies and growth guides.',
      isVerified: true,
    });

    console.log('Created sample users successfully...');

    // Create Posts
    const post1 = await Post.create({
      title: '10 Tips for Modern Glassmorphism Web Design',
      content: `# Design Trends: The Elegance of Glassmorphism

Glassmorphism is a popular design trend characterized by translucent layouts, frosted glass panels, and vibrant background colors. It gives a sleek, futuristic look to web applications.

Here are **10 essential tips** to make your glassmorphism design truly stand out:

## 1. Select the Perfect Backdrop Blur
Too much blur looks muddy; too little makes text unreadable. We recommend:
\`\`\`css
.glass {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
\`\`\`

## 2. Apply Subtle White Borders
An overlay border simulates glass edges. Use a thin border like \`1px solid rgba(255, 255, 255, 0.2)\`.

## 3. Keep Backgrounds Vibrant
Glass works best against colorful, soft-gradient backgrounds. Avoid flat gray backdrops.

- Use mesh gradients
- Play with HSL colors
- Incorporate abstract shapes

> Glassmorphism relies heavily on contrast. Ensure your dark-theme variations decrease background opacity and increase border contrast to maintain visibility!

Have fun building beautiful interfaces!`,
      excerpt: 'Learn the secrets of styling frosted glass cards, shadows, borders, and backdrop filters for beautiful modern web designs.',
      featuredImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
      category: 'Design',
      tags: ['design', 'css', 'glassmorphism', 'webdesign'],
      author: user1._id,
      status: 'Published',
      likes: [user2._id],
    });

    const post2 = await Post.create({
      title: 'Getting Started with React 19 and Tailwind CSS v4',
      content: `# Setting up Vite + React + Tailwind CSS

This guide walks you through bootstrapping a fast web application using Vite, React 19, and the newly updated Tailwind CSS configuration utilities.

## Prerequisites
Ensure Node.js is installed. Run the command:
\`\`\`bash
npm init vite@latest my-app -- --template react
\`\`\`

### Tailwind directives
In your global stylesheet, import:
\`\`\`css
@import "tailwindcss";
\`\`\`

Tailwind CSS will automatically inspect files and compile classes for you!`,
      excerpt: 'A comprehensive step-by-step setup guide for building ultra-fast React applications using Tailwind CSS and Vite.',
      featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
      category: 'Development',
      tags: ['react', 'tailwindcss', 'vite', 'javascript'],
      author: user1._id,
      status: 'Published',
      likes: [adminUser._id, user2._id],
    });

    const post3 = await Post.create({
      title: 'The Future of AI and Agentic Systems',
      content: `# The Dawn of Autonomous Coding Agents

AI systems are transitioning from passive conversational chatbots to active, agentic assistants capable of writing, running, testing, and debugging code autonomously.

## What is Agentic AI?
Unlike traditional models, Agentic AI uses loops and actions:
1. **Planning**: Setting goals and breaking them into sub-tasks.
2. **Tool Use**: Executing code, reading files, searching the web.
3. **Self-Correction**: Inspecting compiler warnings or test suites and rewriting code on failure.

We are entering a new era of human-AI collaboration!`,
      excerpt: 'Explore how agentic models, self-correcting loops, and terminal sandboxes are revolutionizing software development in 2026.',
      featuredImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=800&auto=format&fit=crop',
      category: 'Technology',
      tags: ['ai', 'agentic', 'technology', 'future'],
      author: adminUser._id,
      status: 'Published',
      likes: [user1._id],
    });

    const post4 = await Post.create({
      title: 'How to Launch and Scale a SaaS Startup',
      content: `# Key metrics for growing your software business

Scaling a SaaS company requires finding product-market fit, focusing on unit economics, and driving customer retention.

## Essential SaaS Metrics
- **MRR**: Monthly Recurring Revenue
- **LTV**: Customer Lifetime Value
- **CAC**: Customer Acquisition Cost
- **Churn Rate**: Percentage of users cancelling subscriptions

Ensure your LTV to CAC ratio is greater than 3:1 for sustainable scaling!`,
      excerpt: 'Discover the ultimate playbook for validating, launch testing, and scaling a recurring revenue software startup.',
      featuredImage: 'https://images.unsplash.com/photo-1556761175-b813d53a9628?q=80&w=800&auto=format&fit=crop',
      category: 'Business',
      tags: ['business', 'saas', 'marketing', 'startups'],
      author: user2._id,
      status: 'Published',
      likes: [],
    });

    const post5 = await Post.create({
      title: 'Writing Draft: My Travel Diary to Kyoto',
      content: `# Discovering Kyoto's Ancient Temples

Kyoto is a historic Japanese city known for its beautiful bamboo forests, traditional wooden machiya houses, and iconic red Fushimi Inari shrines.

This post is currently a draft and only visible to the author and administrative moderators!`,
      excerpt: 'A travel review document capturing highlights from my trip to Kyoto, Japan.',
      featuredImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop',
      category: 'Lifestyle',
      tags: ['kyoto', 'japan', 'travel', 'lifestyle'],
      author: user2._id,
      status: 'Draft',
      likes: [],
    });

    console.log('Created sample blog posts successfully...');

    // Create Nested Comments
    const comment1 = await Comment.create({
      content: 'This article is super helpful! Loved the glassmorphism tips.',
      post: post1._id,
      author: user1._id,
    });

    const comment2 = await Comment.create({
      content: 'Totally agree, the CSS code examples are very clean.',
      post: post1._id,
      author: user2._id,
      parentComment: comment1._id,
    });

    // Link reply to parent
    comment1.replies.push(comment2._id);
    await comment1.save();

    const comment3 = await Comment.create({
      content: 'Yes, they copy-paste and render perfectly in Vite!',
      post: post1._id,
      author: user1._id,
      parentComment: comment2._id,
    });

    comment2.replies.push(comment3._id);
    await comment2.save();

    const comment4 = await Comment.create({
      content: 'Nice list. I would also recommend adjusting shadows based on the background color brightness.',
      post: post1._id,
      author: adminUser._id,
    });

    console.log('Created sample nested comments successfully...');
    console.log('Database seeded successfully! Exiting process...');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error: ', error.message);
    process.exit(1);
  }
};

seedDB();
