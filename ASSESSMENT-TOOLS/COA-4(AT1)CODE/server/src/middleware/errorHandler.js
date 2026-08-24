function notFound(req, res) {
  res.status(404).json({ error: "Not Found", message: `No route for ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.name || "Internal Server Error",
    message: err.message || "Something went wrong.",
  });
}

module.exports = { notFound, errorHandler };
