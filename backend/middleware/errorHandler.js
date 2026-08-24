// Central error handler. Never leaks stack traces, SQL, or internal paths to the client.
function notFoundHandler(req, res) {
  res.status(404).json({ message: "The requested resource was not found." });
}

function errorHandler(err, req, res, next) {
  // Log full detail server-side only.
  console.error("[error]", err && err.message ? err.message : err);

  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid request body." });
  }

  const status = err && err.status ? err.status : 500;
  const message =
    status === 500
      ? "Something went wrong on our side. Please try again later."
      : err.message || "Request could not be processed.";

  res.status(status).json({ message });
}

module.exports = { notFoundHandler, errorHandler };
