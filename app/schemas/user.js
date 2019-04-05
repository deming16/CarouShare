// Dependencies
const Joi = require('joi');

// Schema
const id = Joi.string().guid({
    version: ['uuidv4']
});
const username = Joi.string()
    .alphanum()
    .min(3)
    .max(32);
const password = Joi.string().min(1);
const email = Joi.string().email({ minDomainAtoms: 2 });
const address = Joi.string();
const phone = Joi.string();

// APIs
const loginUserBody = Joi.object().keys({
    username: username.required(),
    password: password.required()
});

const signUpUserBody = Joi.object().keys({
    username: username.required(),
    password: password.required(),
    email: email.required(),
    address: address.required(),
    phone: phone.required()
});

const getProfileParam = Joi.object().keys({
    username: username.required()
});

module.exports = {
    FIELDS: {
        id,
        username,
        password,
        email,
        address,
        phone
    },
    loginUserBody,
    signUpUserBody,
    getProfileParam
};
