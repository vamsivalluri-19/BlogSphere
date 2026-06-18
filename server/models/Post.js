const mongoose = require('mongoose');
const slugify = require('slugify');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
    content: {
      type: String,
      required: [true, 'Please add content'],
    },
    excerpt: {
      type: String,
      required: [true, 'Please add an excerpt description'],
      maxlength: [300, 'Excerpt cannot exceed 300 characters'],
    },
    featuredImage: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Draft',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate slug before saving
postSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Virtual populate comments
postSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
  justOne: false,
});

module.exports = mongoose.model('Post', postSchema);
