// middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
    console.error("Error encountered:", err); // Log the error for debugging

    // Handle Prisma Validation Errors
    if (err.name === 'PrismaClientValidationError') {
        return res.status(400).json({
            message: 'Invalid data or Prisma error. Check your query or schema.',
            error: err.message
        });
    }

    // Catch any other errors
    return res.status(500).json({
        message: 'An unexpected error occurred. Please try again later.',
        error: err.message
    });
};

export default errorHandler;
