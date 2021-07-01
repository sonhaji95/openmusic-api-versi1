const Joi = require('joi');

const SongPayloadSchema = Joi.object({
    title: Joi.string().required(),
    /*fungsi integer(), min(), max() untuk memberikan maksimal number yg ditetapkan
    pada nilai tahun */
    year: Joi.number().integer().min(1900).max(2021).required(),
    performer: Joi.string().required(),
    genre: Joi.string(),
    duration: Joi.number(),
});

module.exports = { SongPayloadSchema };