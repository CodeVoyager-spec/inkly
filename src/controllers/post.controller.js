exports.createPost = catchAsync(async (req, res) => {
  const {
    title,
    content,
    category: categoryId,
    tags: tagIds = [],
    status,
  } = req.body;

  // Fetch category and tags
  const [category, tags] = await Promise.all([
    Category.findById(categoryId).lean(),
    tagIds.length
      ? Tag.find({ _id: { $in: tagIds } }).distinct("_id")
      : Promise.resolve([]),
  ]);

  if (!category) {
    throw new AppError(`Category not found with ID: ${categoryId}`, 404);
  }

  if (tagIds.length && tags.length !== tagIds.length) {
    throw new AppError("One or more tags are invalid", 400);
  }

  // Compute status & publishedAt
  const { postStatus, publishedAt } = getPostStatusAndPublishedAt(status);

  // Image upload (OPTIONAL)
  let image = null;

  if (req.file) {
    const uploadedImage = await uploadImage(req.file.buffer, "posts");
    image = {
      url: uploadedImage.secure_url,
      publicId: uploadedImage.public_id,
    };
  }

  const post = await Post.create({
    title,
    content,
    author: req.user.id,
    category: category._id,
    tags,
    image, // will be null if no image uploaded
    status: postStatus,
    publishedAt,
  });

  const populatedPost = await Post.findById(post._id)
    .populate("author", "name email")
    .populate("category", "name")
    .populate("tags", "name");

  res.status(201).json({
    message: "Post created successfully",
    data: populatedPost,
  });
});
