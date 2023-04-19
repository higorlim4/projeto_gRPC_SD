const grpc = require('grpc');
const readline = require('readline');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = __dirname + '/movie.proto';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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

const movie = grpc.loadPackageDefinition(packageDefinition).movie;

const client = new movie.MovieTicketService('localhost:50051', grpc.credentials.createInsecure());

function checkAvailability() {
    rl.question('Qual é o nome do filme? ', (movieName) => {
        rl.question('Qual é o horário da sessão (hh:mm)? ', (sessionTime) => {
            rl.question('Qual é o número do assento? ', (seatNumber) => {
                // Converte a string de horário para um objeto Date
                const sessionDate = new Date(`1970-01-01T${sessionTime}`);

                // Formata o objeto Date para o formato desejado
                const formattedSessionTime = sessionDate.toLocaleTimeString('pt-BR', { timeStyle: 'short' });

                // Cria o objeto de solicitação a ser enviado ao servidor
                const request = {
                    movie_name: movieName,
                    session_time: formattedSessionTime,
                    seat_number: seatNumber.toUpperCase() // Converte a string para maiúsculas
                };

                client.checkAvailability(request, (error, response) => {
                    if (error) {
                        console.error(error);
                        return;
                    }

                    if (response.available) {
                        console.log(`O assento ${seatNumber} está disponível por ${response.price} reais.`);
                    } else {
                        console.log(`O assento ${seatNumber} não está disponível.`);
                    }

                    rl.close();
                });
            });
        });
    });
}

// Example
checkAvailability();
