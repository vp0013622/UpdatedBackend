import { ErrorLogModel } from '../../Models/ErrorLogModel.js';

const isSimilarError = (existingError, newError) => {
    // Compare relevant fields to determine if it's the same error
    return (
        existingError.errorMessage === newError.errorMessage &&
        existingError.lineNumber === newError.lineNumber &&
        existingError.functionName === newError.functionName &&
        existingError.url === newError.url &&
        existingError.method === newError.method
    );
};

export const logError = async (error, req) => {
    try {
        // Extract line number and function name from error stack
        const stackLines = error.stack.split('\n');
        const errorLine = stackLines[1] || ''; // Second line usually contains the actual error location
        const lineMatch = errorLine.match(/:(\d+):\d+/);
        const functionMatch = errorLine.match(/at (.+) \(/);
        
        const errorLog = {
            url: req.originalUrl || 'unknown',
            method: req.method || 'unknown',
            errorMessage: error.message || 'No error message',
            errorStack: error.stack || 'No stack trace',
            lineNumber: lineMatch ? lineMatch[1] : 'unknown',
            functionName: functionMatch ? functionMatch[1].trim() : 'unknown',
            userId: req.user?.id || 'anonymous',
            userIp: req.ip || req.connection.remoteAddress || 'unknown',
            requestBody: req.body || {},
            requestParams: req.params || {},
            requestQuery: req.query || {},
            published: true
        };

        // Try to find a similar existing error
        const existingError = await ErrorLogModel.findOne({
            errorMessage: errorLog.errorMessage,
            lineNumber: errorLog.lineNumber,
            functionName: errorLog.functionName,
            url: errorLog.url,
            method: errorLog.method,
            published: true
        });

        if (existingError) {
            // Update existing error
            await ErrorLogModel.findByIdAndUpdate(existingError._id, {
                $inc: { occurrenceCount: 1 }, // Increment the count
                lastOccurred: new Date(), // Update last occurrence time
                userIp: errorLog.userIp, // Update with latest user IP
                userId: errorLog.userId, // Update with latest user ID
                requestBody: errorLog.requestBody, // Update with latest request data
                requestParams: errorLog.requestParams,
                requestQuery: errorLog.requestQuery,
                errorStack: errorLog.errorStack // Update with latest stack trace
            });

            console.error('Repeated error logged:', {
                url: errorLog.url,
                method: errorLog.method,
                error: errorLog.errorMessage,
                lineNumber: errorLog.lineNumber,
                functionName: errorLog.functionName,
                userId: errorLog.userId,
                userIp: errorLog.userIp,
                occurrenceCount: existingError.occurrenceCount + 1
            });
        } else {
            // Create new error log
            const newErrorLog = await ErrorLogModel.create({
                ...errorLog,
                occurrenceCount: 1,
                firstOccurred: new Date(),
                lastOccurred: new Date()
            });

            console.error('New error logged:', {
                url: errorLog.url,
                method: errorLog.method,
                error: errorLog.errorMessage,
                lineNumber: errorLog.lineNumber,
                functionName: errorLog.functionName,
                userId: errorLog.userId,
                userIp: errorLog.userIp,
                occurrenceCount: 1
            });
        }

    } catch (logError) {
        // If error logging fails, at least log to console
        console.error('Error while logging error:', logError);
        console.error('Original error:', error);
    }
};

export const errorHandler = (err, req, res, next) => {
    // Log the error
    logError(err, req);

    // Send error response
    res.status(err.status || 500).json({
        message: err.status === 404 ? 'Resource not found: The requested endpoint or resource does not exist' : 
                 err.status === 400 ? 'Bad request: Invalid request parameters or missing required fields' :
                 err.status === 401 ? 'Unauthorized: Authentication required to access this resource' :
                 err.status === 403 ? 'Forbidden: Insufficient permissions to access this resource' :
                 err.status === 409 ? 'Conflict: Resource already exists or conflicts with current state' :
                 'Internal server error: An unexpected error occurred while processing your request',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong on our end. Please try again later.'
    });
}; 