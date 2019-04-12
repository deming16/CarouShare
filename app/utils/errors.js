const isString = require('is-string');

class AppError extends Error {
    constructor(param, status = 500) {
        let message = 'Unknown error occured';
        if (!param) param = message;

        if (isString(param)) {
            message = param;
        } else if (param.isJoi) {
            const errors = param.details.map((e) => e.message);
            message = errors.join('\n');
            status = 400;
        } else if (param.name === 'SequelizeUniqueConstraintError') {
            const errors = param.errors.map((e) => e.message);
            message = errors.join('\n');
            status = 400;
        } else if (param instanceof AppError) {
            message = param.message;
            status = param.status;
        } else if (param instanceof Error) {
            // TODO: Show depends on the error
        }

        super(message);
        this.name = 'AppError';
        this.status = status;
    }
}

const ERRORS = {
    userNotFound: () => {
        throw new AppError('User not found', 404);
    },
    somethingWentWrong: (extra, next) => {
        let msg = 'Something went wrong';
        if (extra) msg += ': ' + extra;

        const error = new AppError(msg, 500);
        if (!next) {
            throw error;
        } else {
            next(error);
        }
    },
    invalidUsernameOrPassword: () => {
        throw new AppError('Invalid username or password', 403);
    }
};

module.exports = {
    AppError,
    ERRORS
};
