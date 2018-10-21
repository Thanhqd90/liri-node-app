# liri-node-app
node.js app

This application can return information on a song, movie or upcoming concert depending on the parameters given

Commands

"spotify-this-song":  Returns information on the title on a song through the spotify database.  If you would like more than one song, add a number after the command

Example:  node.js spotify-this-song 4 Fake Love

"movie-this": Returns information on the title of a movie through OMDB

Example:  node.js movie-this The Devil Wears Prada

"concert-this": Returns information on a musical artist for an upcoming concert through the Bands in Town database

Example:  node.js concert-this Drake

"do-what-it-says": Reads random.txt and runs liri.js based on whatever is inside the text-file if it is a valid command

If random.txt contains "movie-this, Mean Girls" Then the application will run the OMDB search for Mean Girls

Video Demonstration: https://www.youtube.com/watch?v=R4zjXvRhTZ4
