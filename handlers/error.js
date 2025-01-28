const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).send("File size exceeds 5MB limit.");
  }
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: err.message,
  });
};

module.exports = errorHandler;
