//impor dotenv dan configurasi
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const songs = require('./api/songs');
const SongsValidator = require('./validator/songs');
const SongsService = require('./services/postgres/SongsService');
const ClientError = require('./exceptions/ClientError');


const init = async () => {
    const songsService = new SongsService();
    
    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });
    /* membuat extentions function untuk life cyle onPreResponse, dimana ia akan mengintervensi response
    sebelum dikirimkan ke client. Bisa menetapkan error handling bila response tersebut merupakan Client error */
    server.ext('onPreResponse', (request, h) => {
        //mendapatkan konteks response dari request
        const { response } = request;

        if (response instanceof ClientError) {
            //membuat response baru dari response toolkit sesuai kebutuhan error handling
            const newResponse = h.response({
                status: 'fail',
                message: response.message,
            });
            newResponse.code(response.statusCode);
            return newResponse;
        }

        /*jika bukan ClientError, lanjutkan dgn response sebelumnya (tanpa terintervensi)*/
        return response.continue || response;
    });
    /* Dgn begitu, di handler , bisa fokus terhadap logika dalam menangani request
    tanpa adanya error handling */

    await server.register({
        plugin: songs,
        options: {
            service: songsService,
            validator: SongsValidator,
        },
    });

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();