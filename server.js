const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = __dirname + '/movie.proto';

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
);

const availableSeats = [
    { movie_name: 'The Godfather', session_time: '20:00', seat_number: 'A1', price: 10.0 },
    { movie_name: 'Madagascar', session_time: '20:00', seat_number: 'A2', price: 10.0 },
    { movie_name: 'Lisbela e o Prisioneiro', session_time: '20:00', seat_number: 'A3', price: 10.0 },
    { movie_name: 'The GodFather', session_time: '22:00', seat_number: 'A1', price: 12.0 },
    { movie_name: 'Madagascar', session_time: '22:00', seat_number: 'A2', price: 12.0 },
    { movie_name: 'Lisbela e o Prisioneiro', session_time: '22:00', seat_number: 'A3', price: 12.0 },
];

const movie = grpc.loadPackageDefinition(packageDefinition).movie;

function checkAvailability(call, callback) {
    const movieName = call.request.movie_name;
    const sessionTime = call.request.session_time;
    const seatNumber = call.request.seat_number;
    let available = false;
    let price = 0;

    const seat = availableSeats.find((s) => s.movie_name === movieName && s.session_time === sessionTime && s.seat_number === seatNumber);

    if (seat) {
        available = true;
        price = seat.price;
    }

    callback(null, { available: available, price: price });
}

const server = new grpc.Server();

server.addService(movie.MovieTicketService.service, {
    CheckAvailability: checkAvailability
});

server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());

console.log('Server running at http://0.0.0.0:50051');

server.start();
