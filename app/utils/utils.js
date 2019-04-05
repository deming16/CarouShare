const Joi = require('joi');
const bcrypt = require('bcrypt');
const { AppError } = require('./errors');

class Utils {
    static validate(obj, schema) {
        const result = Joi.validate(obj, schema);
        if (result.error) throw new AppError(result.error);
        return result;
    }

    static async hashPassword(plain) {
        try {
            return await bcrypt.hash(plain, 10);
        } catch (e) {
            throw new AppError();
        }
    }

    static async verifyPassword(plain, hashed) {
        try {
            return await bcrypt.compare(plain, hashed);
        } catch (e) {
            return false;
        }
    }
}

module.exports = Utils;
