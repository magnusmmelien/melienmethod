import Player from './player.js'; // Adjust the path accordingly
import RatingList from './rating-list.js'; // Adjust the path accordingl
import { Match, matchFromString } from './match.js';

export function toFile(ratingList, filename = "default") {
    const playerStrings = ratingList.getList().map(player => {
        return `${player.getName()};${player.getClub()};${player.getRating()};${player.getRobust()}`;
    });

    const content = playerStrings.join('\n'); // Join the player strings with newline separator
    if (filename === "default") {filename = `data/${ratingList.getName()}_RatingList.txt`;}
    localStorage.setItem(filename, content);
    console.log('RatingList content saved to local storage.');
}

export function fromFile(filename = "default") {
    if (filename === "default") {
        console.log('Error: please input a valid filename for the rating list in fromFile().');
        throw new Error('Error: please input a valid filename for the rating list in fromFile().');
        return;
    }

    const content = sessionStorage.getItem(filename);
    
    if (content) {
        const lines = content.split('\n');
        const players = lines.map(line => {
            const [name, club, rating, robust] = line.split(';');
            return new Player(name, club, parseFloat(rating), parseFloat(robust));
        });

        const ratingList = new RatingList(filename.split('_')[0]);
        players.forEach(player => ratingList.addPlayer(player));

        console.log('RatingList retrieved from local storage');
        return ratingList;
    } else {
        console.log('No RatingList data found in local storage.');
        return null;
    }
}

export function matchesToFile(matches, filename) {
    
    const matchStrings = matches.map(match => {
        return match.matchToString();
    });

    const content = matchString.join('\n');
    localStorage.setItem(filename, content);
    console.log(`Matches saved to local storage "${filename}".`);
}

export function matchesFromFile(ratingList, filename = 'default') {
    if (filename === 'default') { throw new Error('Please input a filename for the matches.') };

    const content = sessionStorage.getItem(filename);

    if (content) {
        const lines = content.split('\n');
        const matches = lines.map(line => {
            return matchFromString(line, ratingList);
        });
        console.log(`Matches successfully retrieved from ${filename}`);
        return matches;
    }
    else {
        console.log(`No matches were found in local storage (${filename})`);
        return null;
    }
}

/*
How to properly save to file upon completion of match:
    1. Fetch latest variables from file
    2. Update live variables
    3. Save to files (rating list & match list)
*/