const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils');

class SongsService {
    constructor() {
        this._pool = new Pool;
    }

    //addSong
    async addSong({ title, year, performer, genre, duration}) {
        const id = "song-" +nanoid(16);
        const createdAt = new Date().toISOString();
        const  updateAt = createdAt;

        const query = {
            text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8)RETURNING ID',
            values: [id, title, year, performer, genre, duration, createdAt, updateAt],
        };

        const result = await this._pool.query(query);
        if (!result.rows[0].id) {
            throw new InvariantError('Lagu gagal ditambahkan');
        }
        return result.rows[0].id;
    }

    //get Songs
    async getSongs(){
        const result = await this._pool.query('SELECT * FROM songs');
        return result.rows.map(mapDBToModel);
    }

    //get song id
    async getSongById(id) {
        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [id],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan')[0];
        }
        return result.rows.map(mapDBToModel);
    }

    //put song id
    async editSongById(id, { title, year, performer, genre, duration}) {
        const updateAt = new Date().toISOString();
        const query = {
            text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, updated_at = $6, WHERE id = $7 RETURNING id',
            values: [title, year, performer, genre, duration, updateAt, id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
        }
    }

    //delete song id
    async deleteSongById(id) {
        const query = {
            text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
        }
    }
}

module.exports = SongsService;