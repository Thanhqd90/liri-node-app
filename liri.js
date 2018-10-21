// Required modules
const dotenv = require("dotenv").config();

const fs = require('fs');
const request = require('request');
const moment = require('moment');
const keys = require("./keys.js");
const Spotify = require('node-spotify-api');
const colors = require('colors');

// Passes command from terminal
var command = process.argv[2];
var searchValue = "";

// Puts together the search value into one string
for (var i = 3; i < process.argv.length; i++) {
    searchValue += process.argv[i] + " ";
};

// Error Functions 
function errorFunction(err) {
    if (err) {
        return console.log("Error occured: ", err);
    }
};

// Main switch case based on search term passed

switch (command) {
    case "spotify-this-song":
        searchSong(searchValue);
        break;
    case "concert-this":
        searchConcert(searchValue);
        break;
    case "movie-this":
        searchMovie(searchValue);
        break;
    case "do-what-it-says":
        randomSearch();
        break;
    default:
        console.log("\nYou entered " + `"${command}"`.bold.red + " which is not a valid command. Please try one of the following commands\n");
        console.log("1. For a random search:".bold.magenta + " node liri.js do-what-it-says\n".bold.yellow);
        console.log("2. To search a movie title:".bold.magenta + " node liri.js movie-this *movie title*\n".bold.yellow + "Example: node liri.js movie-this The Devil Wears Prada\n".bold.blue);
        console.log("3. To search for an upcoming concert:".bold.magenta + " node liri.js concert-this *Name of artist*\n".bold.yellow + "Example: node liri.js concert-this Lady Gaga\n".bold.blue);
        console.log("4. To search Spotify for a song:".bold.magenta + " node liri.js spotify-this-song *number of results* *song title*\n".bold.yellow + "Example: node liri.js spotify-this-song 3 Fake Love\n".bold.blue);
};

// spotify-this-song function
function searchSong(searchValue) {

    // Default search value if no song is given
    if (searchValue == "") {
        searchValue = "The Sign Ace of Base";
    }

    // Access Spotify keys  
    var spotify = new Spotify(keys.spotify);

    var searchLimit = "";

    // Allows the user to input the number of returned spotify results.  Defaults to 1 is no number is input
    if (isNaN(parseInt(process.argv[3])) == false) {
        searchLimit = process.argv[3];

        console.log("\nNumber of songs requested: " + searchLimit);

        // Resets the searchValue if search limit is empty
        searchValue = "";
        for (var i = 4; i < process.argv.length; i++) {
            searchValue += process.argv[i] + " ";
        };

    } else {
        console.log("\nFor more than 1 result, add the number of results you would like to be returned after spotify-this-song.".bold.blue + "\nExample: node.js spotify-this-song 4 Fake Love".bold.grey)
        searchLimit = 1;
    }

    // Search spotify with given values
    spotify.search({
        type: 'track',
        query: searchValue,
        limit: searchLimit
    }, function (err, response) {

        fs.appendFile("log.txt", "\r\n== Spotify Log Entry Start ==\r\nProcessed on:\n" + Date() + "\r\n" + "Terminal commands:\n" + process.argv + "\r\n");

        let songResp = response.tracks.items;

        for (var i = 0; i < songResp.length; i++) {
            console.log("\n=============== ".bold.red + `Spotify Search Result ${(i + 1)}`.bold.yellow + " ===============\n".bold.red);
            console.log(("Artist: ".bold.magenta + songResp[i].artists[0].name));
            console.log(("Song title: ".bold.magenta + songResp[i].name));
            console.log(("Album name: ".bold.magenta + songResp[i].album.name));
            console.log(("Preview link: ".bold.magenta + songResp[i].preview_url));
            console.log("\n=============== ".bold.red + `End of Search Result ${(i + 1)}`.bold.yellow + " ===============\n".bold.red);

            fs.appendFile("log.txt", "\r\n========= Result " + (i + 1) + " =========\r\nArtist: " + songResp[i].artists[0].name + "\r\nSong title: " + songResp[i].name + "\r\nAlbum name: " + songResp[i].album.name + "\r\nURL Preview: " + songResp[i].preview_url + "\r\n=============================\n");
        }

        fs.appendFile("log.txt", "\r\n== Spotify Log Entry End ==\n");
    })
};

// movie-this search function
function searchMovie(searchValue) {

    // Default search value if no movie is given
    if (searchValue == "") {
        searchValue = "Mr. Nobody";
    }

    var queryUrl = "http://www.omdbapi.com/?t=" + searchValue.trim() + "&y=&plot=short&apikey=trilogy";

    request(queryUrl, function (err, response, body) {

        fs.appendFile("log.txt", "\r\n--OMDB Log Entry Start--\r\nProcessed on:\n" + Date() + "\r\n" + "Terminal commands:\n" + process.argv + "\r\n");

        ;

        if (JSON.parse(body).Error == 'Movie not found!') {

            console.log("\nNo results found for " + searchValue + ". Please search for another title.\n")

            fs.appendFile("log.txt", "No results found for " + searchValue + ". Please search for another title.\n\n--OMDB Log Entry End---\n\n");

        } else {

            let movieBody = JSON.parse(body);

            console.log("\n========== ".bold.red + "OMDB Search Results ".bold.yellow + " ==========\n".bold.red);
            console.log("Movie Title: ".bold.blue + movieBody.Title);
            console.log("Year: ".bold.blue + movieBody.Year);
            console.log("IMDB rating: ".bold.blue + movieBody.imdbRating);


            // If there is no Rotten Tomatoes Rating
            if (movieBody.Ratings.length < 2) {

                console.log("There is no Rotten Tomatoes Rating for this movie.")

                fs.appendFile("log.txt", "\r\nMovie Title: " + movieBody.Title + "\r\nYear: " + movieBody.Year + "\r\nIMDB rating: " + movieBody.imdbRating + "\r\nRotten Tomatoes Rating: There is no Rotten Tomatoes Rating for this movie" + movieBody.Ratings[[1]].Value + "\r\nCountry: " + movieBody.Country + "\r\nLanguage: " + movieBody.Language + "\r\nPlot: " + movieBody.Plot + "\r\nActors: " + movieBody.Actors + "\r\n--OMDB Log Entry End--\n");

            } else {

                console.log("Rotten Tomatoes Rating: ".bold.blue + movieBody.Ratings[[1]].Value);

                fs.appendFile("log.txt", "\r\nMovie Title: " + movieBody.Title + "\r\nYear: " + movieBody.Year + "\r\nIMDB rating: " + movieBody.imdbRating + "\r\nRotten Tomatoes Rating: " + movieBody.Ratings[[1]].Value + "\r\nCountry: " + movieBody.Country + "\r\nLanguage: " + movieBody.Language + "\r\nPlot: " + movieBody.Plot + "\r\nActors: " + movieBody.Actors + "\r\n--OMDB Log Entry End--\n");
            }

            console.log("Country: ".bold.blue + movieBody.Country);
            console.log("Language: ".bold.blue + movieBody.Language);
            console.log("Plot: ".bold.blue + movieBody.Plot);
            console.log("Actors: ".bold.blue + movieBody.Actors);
            console.log("\n========== ".bold.red + "End of Search Results ".bold.yellow + " ==========\n".bold.red);
        };
    });
};



// concert-this function
function searchConcert(searchValue) {

    // Default search value if no movie is given
    if (searchValue == "") {
        searchValue = "Lady Gaga";
    }

    let queryUrl = "https://rest.bandsintown.com/artists/" + searchValue.trim() + "/events?app_id=codingbootcamp&date=upcoming";

    request(queryUrl, function (err, response, body) {

        fs.appendFile("log.txt", "\r\n**Concert Log Entry Start** \r\nProcessed on: \n" + Date() + "\r\n" + "Terminal commands:\n" + process.argv + "\n\n");

        if (JSON.parse(body).Error == "No upcoming concerts for " + searchValue) {

            console.log("\nNo results found for " + searchValue + ". Please try another artist.\n")

            fs.appendFile("log.txt", "No results found for " + searchValue + ". Please try another artist.\r\n**Concert Log Entry End**");

        } else {

            let concertBody = JSON.parse(body);
            let dateFormat = 'dddd, MMMM Do YYYY [at] h:mm A'; // date displayed in the format of Thursday, April 12th 2018 at 6:29 PM

            console.log("\n========== ".bold.red + "Bands in Town Search Results ".bold.yellow + " ==========\n".bold.red);
            console.log("Artist Name: ".bold.green + searchValue);
            console.log("Venue Name: ".bold.green + concertBody[0].venue.name);
            console.log("Venue Location: ".bold.green + concertBody[0].venue.city + ", " + concertBody[0].venue.region);
            console.log("Date of Event: ".bold.green + moment(concertBody[0].datetime).format(dateFormat));
            console.log("\n========== ".bold.red + "End of Search Results ".bold.yellow + " ==========\n".bold.red);


        };
    });
};

// do-what-it-says function
function randomSearch() {

    fs.readFile("random.txt", "utf8", function (respError, data) {

        var randomArray = data.split(",");

        if (randomArray[0] == "spotify-this-song") {
            searchSong(randomArray[1]);
        } else if (randomArray[0] == "movie-this") {
            searchMovie(randomArray[1]);
        }
    });
};