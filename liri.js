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

// Switch case based on search term passed
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
    default: // If no value is passed after node liri.js display the following information on the terminal
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
    let spotify = new Spotify(keys.spotify);

    // Reset number of songs return to empty value
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
        // Lets user know they have the option return more than 1 song by showing an example on the terminal
        console.log("\nFor more than 1 result, add the number of results you would like to be returned after spotify-this-song.".bold.blue + "\nExample: node.js spotify-this-song 4 Fake Love".bold.grey)
        searchLimit = 1;
    }

    // Search spotify with given values
    spotify.search({
        type: 'track',
        query: searchValue,
        limit: searchLimit
    }, function (err, response) {

        // Start spotify log.txt
        fs.appendFile("log.txt", "\r\n== Spotify Log Entry Start ==\r\nProcessed on:\n" + Date() + "\r\n" + "Terminal commands:\n" + process.argv + "\r\n");

        let songResp = response.tracks.items;

        for (var i = 0; i < songResp.length; i++) {
            //Display results to terminal
            console.log("\n=============== ".bold.red + `Spotify Search Result ${(i + 1)}`.bold.yellow + " ===============\n".bold.red);
            console.log(("Artist: ".bold.magenta + songResp[i].artists[0].name));
            console.log(("Song title: ".bold.magenta + songResp[i].name));
            console.log(("Album name: ".bold.magenta + songResp[i].album.name));
            console.log(("Preview link: ".bold.magenta + songResp[i].preview_url));
            console.log("\n=============== ".bold.red + `End of Search Result ${(i + 1)}`.bold.yellow + " ===============\n".bold.red);

        //  Append search information to log.txt
            fs.appendFile("log.txt", "\r\n========= Result " + (i + 1) + " =========\r\nArtist: " + songResp[i].artists[0].name + "\r\nSong title: " + songResp[i].name + "\r\nAlbum name: " + songResp[i].album.name + "\r\nURL Preview: " + songResp[i].preview_url + "\r\n=============================\r\n");
        }

        // End spotify log.txt
        fs.appendFile("log.txt", "\r\n== Spotify Log Entry End ==\n");
    })
};

// movie-this search function
function searchMovie(searchValue) {
    let omdb = keys.omdb;

    // Default search value if no movie is given
    if (searchValue == "") {
        searchValue = "Mr. Nobody";
    }

    var queryUrl = "http://www.omdbapi.com/?t=" + searchValue.trim() + "&y=&plot=short&apikey=" + omdb;

    request(queryUrl, function (err, response, body) {

        // Start OMDB log.txt
        fs.appendFile("log.txt", "\r\n--OMDB Log Entry Start--\r\nProcessed on:\n" + Date() + "\r\n" + "Terminal commands:\n" + process.argv + "\r\n");

        if (JSON.parse(body).Error == 'Movie not found!') {

            //Display no results to terminal
            console.log("\nNo results found for " + searchValue + ". Please search for another title.\n")

            //Append no results to log.txt
            fs.appendFile("log.txt", "No results found for " + searchValue + ". Please search for another title.\n\n--OMDB Log Entry End---\r\n");

        } else {

            let movieBody = JSON.parse(body);

            //Display first half of movie information to terminal
            console.log("\n========== ".bold.red + "OMDB Search Results ".bold.yellow + " ==========\n".bold.red);
            console.log("Movie Title: ".bold.blue + movieBody.Title);
            console.log("Year: ".bold.blue + movieBody.Year);
            console.log("IMDB rating: ".bold.blue + movieBody.imdbRating);


            // If there is no Rotten Tomatoes Rating
            if (movieBody.Ratings.length < 2) {
                //Display no Rotten Tomatoes ratings to terminal
                console.log("There is no Rotten Tomatoes Rating for this movie.")

                // Append information without Rotten Tomatoes rating to log.txt
                fs.appendFile("log.txt", "\r\nMovie Title: " + movieBody.Title + "\r\nYear: " + movieBody.Year + "\r\nIMDB rating: " + movieBody.imdbRating + "\r\nRotten Tomatoes Rating: There is no Rotten Tomatoes Rating for this movie" + movieBody.Ratings[[1]].Value + "\r\nCountry: " + movieBody.Country + "\r\nLanguage: " + movieBody.Language + "\r\nPlot: " + movieBody.Plot + "\r\nActors: " + movieBody.Actors + "\r\n--OMDB Log Entry End--\r\n");

            } else {
                //Display Rotten Tomatoes rating to terminal
                console.log("Rotten Tomatoes Rating: ".bold.blue + movieBody.Ratings[[1]].Value);

                // Append all returned information log.txt
                fs.appendFile("log.txt", "\r\nMovie Title: " + movieBody.Title + "\r\nYear: " + movieBody.Year + "\r\nIMDB rating: " + movieBody.imdbRating + "\r\nRotten Tomatoes Rating: " + movieBody.Ratings[[1]].Value + "\r\nCountry: " + movieBody.Country + "\r\nLanguage: " + movieBody.Language + "\r\nPlot: " + movieBody.Plot + "\r\nActors: " + movieBody.Actors + "\r\n--OMDB Log Entry End--\r\n");
            }

            //Display Display the rest of the movie information to terminal
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
    let bands = keys.bands;

    // Default search value if no movie is given
    if (searchValue == "") {
        searchValue = "Lady Gaga";
    }

    let queryUrl = "https://rest.bandsintown.com/artists/" + searchValue.trim() + "/events?app_id=" + bands + "&date=upcoming";

    request(queryUrl, function (err, response, body) {

        //Start Bands in Town log.txt
        fs.appendFile("log.txt", "\r\n**Concert Log Entry Start** \r\nProcessed on: \n" + Date() + "\r\n" + "Terminal commands:\n" + process.argv + "\r\n");

        //No results found
        if (JSON.parse(body).Error == "No upcoming concerts for " + searchValue) {

            //Display no results to terminal
            console.log("\nNo results found for " + searchValue + ". Please try another artist.\r\n")

            //Append no results to log.txt
            fs.appendFile("log.txt", "No results found for " + searchValue + ". Please try another artist.\r\n**Concert Log Entry End**\r\n");

        } else {

            let concertBody = JSON.parse(body);
            let dateFormat = 'dddd, MMMM Do YYYY [at] h:mm A'; // date displayed in the format of Thursday, April 12th 2018 at 6:29 PM

            //Display Concert information to terminal
            console.log("\n========== ".bold.red + "Bands in Town Search Results ".bold.yellow + " ==========\n".bold.red);
            console.log("Artist Name: ".bold.green + searchValue);
            console.log("Venue Name: ".bold.green + concertBody[0].venue.name);
            console.log("Venue Location: ".bold.green + concertBody[0].venue.city + ", " + concertBody[0].venue.region);
            console.log("Date of Event: ".bold.green + moment(concertBody[0].datetime).format(dateFormat));
            console.log("\n========== ".bold.red + "End of Search Results ".bold.yellow + " ==========\n".bold.red);

            //Append returned results to log.txt
            fs.appendFile("log.txt", "\r\nArtist Name: " + searchValue + "\r\nVenue Name: " + concertBody[0].venue.name + "\r\nVenue Location: " + concertBody[0].venue.city + ", " + concertBody[0].venue.region + "\r\nDate of Event: " + moment(concertBody[0].datetime).format(dateFormat) + "\r\n**Concert Log Entry End**\r\n");

        };
    });
};

// do-what-it-says function
function randomSearch() {

    //Read random.txt file
    fs.readFile("random.txt", "utf8", function (err, data) {

    //Split text into an array after comma
    var randomArray = data.split(",");

    //Initiate liri.js based on what the text at index 0 says with index 1 as the search parameter
        if (randomArray[0] == "spotify-this-song") {
            searchSong(randomArray[1]);
        } else if (randomArray[0] == "movie-this") {
            searchMovie(randomArray[1]);
        }
    });
};