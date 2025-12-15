const page1 = document.getElementById('page1');
const page2 = document.getElementById('page2');
const page3 = document.getElementById('page3');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const flag1 = document.getElementById('flag1'); // Add flag variables for each flag box
const flag2 = document.getElementById('flag2');
const flag3 = document.getElementById('flag3');
const groupsCounter = document.getElementById('groupsCounter'); // Get the counter elements
const minusButton = document.getElementById('minusButton');
const plusButton = document.getElementById('plusButton');
const playersSelect = document.getElementById('playersSelect');
const formatErrorMessage = document.getElementById('formatErrorMessage');
const groupsPage2 = document.getElementById('group-container');
const formatErrorMessagePage2 = document.getElementById('formatErrorMessagePage2');


// Create an empty matrix with a specified number of rows and columns
function createEmptyMatrix(rows, Qs) {
    const cols = Math.floor(Qs/rows) + 2;
    console.log('Creating empty ' + rows + 'x' + cols + '-matrix.');

    const matrix = [];

    for (let i = 0; i < rows; i++) {
        matrix[i] = new Array(cols).fill(null);
    }

    return matrix;
}

/*
function isMatrixEmpty(matrix) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] !== null) {
                return false; // Found a non-null value, matrix is not empty
            }
        }
    }
    return true; // No non-null values found, matrix is empty
}
*/

function isMatrixComplete(matrix, desiredGroups, desiredQuals) {
    console.log('Is matrix complete?');
    const test = false;
    if (matrix.length < desiredGroups) return false;
    if (test) {console.log('Test 1');}
    if (matrix[0].length * desiredGroups < desiredQuals) return false;
    if (test) {console.log('Test 2');}
    for (let i = 0; i < desiredGroups; i++) {
        if (test) {console.log('Test 3');}
        for (let j = 0; j * desiredGroups < desiredQuals; j++) {
            
            if (test) {console.log('Test: matrix[' + i + '][' + j + '] = ' + matrix[i][j]);}
            if (matrix[i][j] === null || matrix[i][j] === '') {
                return false; // Found a null value, matrix is not complete
            }
        }
    }
    if (test) {console.log('Test 3');}
    console.log('...Yes');
    return true;
}

function getRandomInt(n) {
    // Note: I have checked (in real deployment) that this works correctly and there is no need consider the random-seed.
    return Math.floor(Math.random() * n);
}

function getRandomShuffledIndices(n, l) {
    if (l > n) {
        throw new Error("Number of indices requested cannot exceed the maximum value.");
    }

    const indices = new Set();

    while (indices.size < l) {
        indices.add(getRandomInt(n));
    }

    const shuffledIndices = Array.from(indices);
    for (let i = shuffledIndices.length - 1; i > 0; i--) {
        const j = getRandomInt(i + 1);
        [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
    }

    return shuffledIndices;
}

// Initializaion of qualifiersMatrix
let numGroups = 1; // Number of rows (default: 1 groups)
let numQs = 1; // Number of columns (default: 1 qualifiers)
let qualifiersMatrix = createEmptyMatrix(numGroups, numQs);


// Function to hide all pages
function hidePages() {
    page1.style.display = 'none';
    page2.style.display = 'none';
    page3.style.display = 'none';
}

// Add this function to generate the input fields and headings
function generateGroupFields(numberOfGroups, numberOfQualifiers) {
    console.log('Generating group fields for ' + numberOfGroups + ' groups and ' + numberOfQualifiers + ' qualifiers.');
    const groupContainer = document.getElementById('group-container');
    groupContainer.innerHTML = ''; // Clear any previous content

    
    for (let i = 0; i < numberOfGroups; i++) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'group-position';

        const heading = document.createElement('h4');
        heading.textContent = 'Group ' + String.fromCharCode(65 + i);

        const inputFields = document.createElement('div');
        inputFields.className = 'input-fields';

        for (let j = 0; (j+1-1) < numberOfQualifiers/numberOfGroups + 1; j++) {
            const inputDiv = document.createElement('div');
            const numberSpan = document.createElement('span');
            numberSpan.textContent = (j + 1);
            numberSpan.className = 'player-number'; // Add the class here
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'player-input'; // Add the class here

            /*try {
                if we don't like that it potentially will say "invalid"/"" at the extra bottom space of the groups...
            } catch (error) {
                
            }*/

            if (qualifiersMatrix[i][j] !== null &&  qualifiersMatrix[i][j] !== '') {
                input.value = qualifiersMatrix[i][j];
            }
            if ((j+1-1) * numberOfGroups < numberOfQualifiers) {
                input.placeholder = 'Enter name... (required)';
            } else {
                input.placeholder = 'Enter name...';
            }

            inputDiv.appendChild(numberSpan);
            inputDiv.appendChild(input);
            inputFields.appendChild(inputDiv);
        }

        groupDiv.appendChild(heading);
        groupDiv.appendChild(inputFields);
        groupContainer.appendChild(groupDiv);
    
    }
    
}

function saveQualifiers() {
    /*console.log('Saving qualifiers in matrix');*/
    const inputFields = document.querySelectorAll('.player-input');
    /*console.log('Test 1: inputFields[0].value = ' + inputFields[0].value);*/
    const numberOfGroups = parseInt(groupsCounter.textContent);
    const numberOfPlayersInGroup = inputFields.length / numberOfGroups;

    for (let i = 0; i < inputFields.length; i++) {
        const input = inputFields[i];
        const row = Math.floor(i / numberOfPlayersInGroup); // Calculate the row based on input index
        const col = i % numberOfPlayersInGroup; // Calculate the column based on input index

        qualifiersMatrix[row][col] = input.value; // Trim to remove any extra whitespace
    }
    /*console.log('Save quals test: qualifiersMatrix[0][0] = ' + qualifiersMatrix[0][0]);*/
}

function generateDrawMethod_3_8(qualMatrix) {
    const drawMatrix = [];
    const numRows = qualMatrix.length;
    const numCols = qualMatrix[0].length;
    const luckyLosers = getRandomShuffledIndices(numRows, 2); // We need 2 lucky losers

    /* Make sure A1 doesn't meet A3 or C1-C3 */
    if (luckyLosers[0] === 0 || luckyLosers[1] === 2) { //If LL1 === A3 or LL2 === C3
        [luckyLosers[0], luckyLosers[1]] = [luckyLosers[1], luckyLosers[0]]; //then: swap them
    }

    //A1 vs. ll(not A3)
    drawMatrix.push([qualMatrix[0][0], qualMatrix[luckyLosers[0]][2]]);

    //B2 vs. C2
    drawMatrix.push([qualMatrix[1][1], qualMatrix[2][1]]);

    //B1 vs. A2
    drawMatrix.push([qualMatrix[1][0], qualMatrix[0][1]]);

    //C1 vs. ll(not C3)
    drawMatrix.push([qualMatrix[2][0], qualMatrix[luckyLosers[1]][2]]);

    // Return the generated draw matrix
    return drawMatrix;
}
function generateDrawMethod_4_8(qualMatrix) {
    const drawMatrix = [];

    // A1 vs. C2
    drawMatrix.push([qualMatrix[0][0], qualMatrix[2][1]]);

    // B1 vs. D2
    drawMatrix.push([qualMatrix[1][0], qualMatrix[3][1]]);

    // C1 vs. A2
    drawMatrix.push([qualMatrix[2][0], qualMatrix[0][1]]);

    // D1 vs. B2
    drawMatrix.push([qualMatrix[3][0], qualMatrix[1][1]]);

    // Return the generated draw matrix
    return drawMatrix;
}
function generateDrawMethod_4_16(qualMatrix) {
    const drawMatrix = [];

    // A1 vs. B4
    drawMatrix.push([qualMatrix[0][0], qualMatrix[1][3]]);

    // C2 vs. D3
    drawMatrix.push([qualMatrix[2][1], qualMatrix[3][2]]);

    // D2 vs. C3
    drawMatrix.push([qualMatrix[3][1], qualMatrix[2][2]]);

    // B1 vs. A4
    drawMatrix.push([qualMatrix[1][0], qualMatrix[0][3]]);

    // C1 vs. D4
    drawMatrix.push([qualMatrix[2][0], qualMatrix[3][3]]);

    // A2 vs. B3
    drawMatrix.push([qualMatrix[0][1], qualMatrix[1][2]]);

    // B2 vs. A3
    drawMatrix.push([qualMatrix[1][1], qualMatrix[0][2]]);

    // D1 vs. C4
    drawMatrix.push([qualMatrix[3][0], qualMatrix[2][3]]);

    // Return the generated draw matrix
    return drawMatrix;
}
function generateDrawMethod_5_8(qualMatrix) {
    const drawMatrix = [];
    const numRows = qualMatrix.length;
    let luckyLosers = getRandomShuffledIndices(numRows, 3); // We need 3 lucky losers

    if (luckyLosers[2] === 4) {
        [luckyLosers[2], luckyLosers[1]] = [luckyLosers[1], luckyLosers[2]]; // this means that LL[2] !== E2
    }
    if (luckyLosers[1] === 3) {
        [luckyLosers[1], luckyLosers[0]] = [luckyLosers[0], luckyLosers[1]]; // this means that LL[1] !== D2
    }
    if (luckyLosers[0] === 0) {
        [luckyLosers[0], luckyLosers[2]] = [luckyLosers[2], luckyLosers[0]]; // this means that LL[0] !== A2 (note that LL[2] still wont be changed to E2 by this!)
    }

    // A1 vs. LL(not A2)
    drawMatrix.push([qualMatrix[0][0], qualMatrix[luckyLosers[0]][1]]);

    // C1 vs. B1
    drawMatrix.push([qualMatrix[2][0], qualMatrix[1][0]]);

    // D1 vs. LL(not D2)
    drawMatrix.push([qualMatrix[3][0], qualMatrix[luckyLosers[1]][1]]);

    // E1 vs. LL(not E2)
    drawMatrix.push([qualMatrix[4][0], qualMatrix[luckyLosers[2]][1]]);

    // Return the generated draw matrix
    return drawMatrix;
}
function generateDrawMethod_5_16(qualMatrix) {
    const drawMatrix = [];
    const numRows = qualMatrix.length;
    const numCols = qualMatrix[0].length;
    const luckyLoser = getRandomInt(numRows); // We need 1 lucky losers

    // A1 vs. LL
    drawMatrix.push([qualMatrix[0][0], qualMatrix[luckyLoser][3]]);

    // D2 vs. E2
    drawMatrix.push([qualMatrix[3][1], qualMatrix[4][1]]);

    // B1 vs. E3
    drawMatrix.push([qualMatrix[1][0], qualMatrix[4][2]]);

    // C1 vs. D3
    drawMatrix.push([qualMatrix[2][0], qualMatrix[3][2]]);

    // D1 vs. C3
    drawMatrix.push([qualMatrix[3][0], qualMatrix[2][2]]);

    // B2 vs. A2
    drawMatrix.push([qualMatrix[1][1], qualMatrix[0][1]]);

    // C2 vs. A3
    drawMatrix.push([qualMatrix[2][1], qualMatrix[0][2]]);

    // E1 vs. B3
    drawMatrix.push([qualMatrix[4][0], qualMatrix[1][2]]);

    // Return the generated draw matrix
    return drawMatrix;
}
function generateDrawMethod_6_8(qualMatrix) {
    const drawMatrix = [];
    const numRows = qualMatrix.length;
    let luckyLosers = getRandomShuffledIndices(numRows, 2); // We need 2 lucky losers

    if (luckyLosers[1] === 5) {
        [luckyLosers[1], luckyLosers[0]] = [luckyLosers[0], luckyLosers[1]]; // this means that LL[1] !== F2
    }
    if (luckyLosers[0] === 0) {
        [luckyLosers[0], luckyLosers[1]] = [luckyLosers[1], luckyLosers[0]]; // this means that LL[0] !== A2 (note that LL[1] still wont be changed to F2 by this!)
    }

    // A1 vs. LL(not A2)
    drawMatrix.push([qualMatrix[0][0], qualMatrix[luckyLosers[0]][1]]);

    // C1 vs. B1
    drawMatrix.push([qualMatrix[2][0], qualMatrix[1][0]]);

    // D1 vs. E1
    drawMatrix.push([qualMatrix[3][0], qualMatrix[4][0]]);

    // F1 vs. LL(not F2)
    drawMatrix.push([qualMatrix[5][0], qualMatrix[luckyLosers[1]][1]]);

    // Return the generated draw matrix
    return drawMatrix;
}
function generateDrawMethod_6_16(qualMatrix) {
    const drawMatrix = [];
    const numRows = qualMatrix.length;
    let luckyLoserIndices = getRandomShuffledIndices(numRows, 4); // We need 4 lucky losers

    if (luckyLoserIndices[3] === 5) {
        [luckyLoserIndices[3], luckyLoserIndices[2]] = [luckyLoserIndices[2], luckyLoserIndices[3]]; // this means that LL[3] !== F3
    }
    if (luckyLoserIndices[2] === 3) {
        [luckyLoserIndices[2], luckyLoserIndices[1]] = [luckyLoserIndices[1], luckyLoserIndices[2]]; // this means that LL[2] !== D3
    }
    if (luckyLoserIndices[1] === 2) {
        [luckyLoserIndices[1], luckyLoserIndices[0]] = [luckyLoserIndices[0], luckyLoserIndices[1]]; // this means that LL[1] !== C3
    }
    if (luckyLoserIndices[0] === 0) {
        [luckyLoserIndices[0], luckyLoserIndices[3]] = [luckyLoserIndices[3], luckyLoserIndices[0]]; // this means that LL[0] !== A3
    }

    // A1 vs. LL(not A3)
    drawMatrix.push([qualMatrix[0][0], qualMatrix[luckyLoserIndices[0]][2]]);

    // B2 vs. D2
    drawMatrix.push([qualMatrix[1][1], qualMatrix[3][1]]);

    // E1 vs. F2
    drawMatrix.push([qualMatrix[4][0], qualMatrix[5][1]]);

    // C1 vs. LL(not C3)
    drawMatrix.push([qualMatrix[2][0], qualMatrix[luckyLoserIndices[1]][2]]);

    // D1 vs. LL(not D3)
    drawMatrix.push([qualMatrix[3][0], qualMatrix[luckyLoserIndices[2]][2]]);

    // B1 vs. A2
    drawMatrix.push([qualMatrix[1][0], qualMatrix[0][1]]);

    // E2 vs. C2
    drawMatrix.push([qualMatrix[4][1], qualMatrix[2][1]]);

    // F1 vs. LL(not F3)
    drawMatrix.push([qualMatrix[5][0], qualMatrix[luckyLoserIndices[3]][2]]);

    // Return the generated draw matrix
    return drawMatrix;
}
function generateDrawMethod_7_16(qualMatrix) {
    const drawMatrix = [];
    const numRows = qualMatrix.length;
    let luckyLosers = getRandomShuffledIndices(numRows, 2); // We need 2 lucky losers

    if (luckyLosers[1] === 6) {
        [luckyLosers[1], luckyLosers[0]] = [luckyLosers[0], luckyLosers[1]]; // this means that LL[1] !== G3
    }
    if (luckyLosers[0] === 0) {
        [luckyLosers[0], luckyLosers[1]] = [luckyLosers[1], luckyLosers[0]]; // this means that LL[0] !== A3 (note that LL[1] still wont be changed to G3 by this!)
    }

    // A1 vs. LL(not A3)
    drawMatrix.push([qualMatrix[0][0], qualMatrix[luckyLosers[0]][1]]);

    // F2 vs. E2
    drawMatrix.push([qualMatrix[5][1], qualMatrix[4][1]]);

    // B1 vs. D2
    drawMatrix.push([qualMatrix[1][0], qualMatrix[3][1]]);

    // C1 vs. G2
    drawMatrix.push([qualMatrix[2][0], qualMatrix[6][1]]);

    // D1 vs. A2
    drawMatrix.push([qualMatrix[3][0], qualMatrix[0][1]]);

    // E1 vs. C2
    drawMatrix.push([qualMatrix[4][0], qualMatrix[2][1]]);

    // F1 vs. B2
    drawMatrix.push([qualMatrix[5][0], qualMatrix[1][1]]);

    // G1 vs. LL(not G3)
    drawMatrix.push([qualMatrix[6][0], qualMatrix[luckyLosers[1]][1]]);

    // Return the generated draw matrix
    return drawMatrix;
}
function generateDrawMethod_8_16(qualMatrix) {
    const drawMatrix = [];

    // A1 vs. F2
    drawMatrix.push([qualMatrix[0][0], qualMatrix[5][1]]);

    // B1 vs. E2
    drawMatrix.push([qualMatrix[1][0], qualMatrix[4][1]]);

    // C1 vs. H2
    drawMatrix.push([qualMatrix[2][0], qualMatrix[7][1]]);

    // D1 vs. G2
    drawMatrix.push([qualMatrix[3][0], qualMatrix[6][1]]);

    // E1 vs. B2
    drawMatrix.push([qualMatrix[4][0], qualMatrix[1][1]]);

    // F1 vs. A2
    drawMatrix.push([qualMatrix[5][0], qualMatrix[0][1]]);

    // G1 vs. D2
    drawMatrix.push([qualMatrix[6][0], qualMatrix[3][1]]);

    // H1 vs. C2
    drawMatrix.push([qualMatrix[7][0], qualMatrix[2][1]]);

    // Return the generated draw matrix
    return drawMatrix;
}
function generateDrawMethod_16_32(qualMatrix) {
    const drawMatrix = [];

    // A1 vs. K2
    drawMatrix.push([qualMatrix[0][0], qualMatrix[10][1]]);

    // B1 vs. L2
    drawMatrix.push([qualMatrix[1][0], qualMatrix[11][1]]);

    // C1 vs. I2
    drawMatrix.push([qualMatrix[2][0], qualMatrix[8][1]]);

    // D1 vs. J2
    drawMatrix.push([qualMatrix[3][0], qualMatrix[9][1]]);

    // E1 vs. O2
    drawMatrix.push([qualMatrix[4][0], qualMatrix[14][1]]);

    // F1 vs. P2
    drawMatrix.push([qualMatrix[5][0], qualMatrix[15][1]]);

    // G1 vs. M2
    drawMatrix.push([qualMatrix[6][0], qualMatrix[12][1]]);

    // H1 vs. N2
    drawMatrix.push([qualMatrix[7][0], qualMatrix[13][1]]);

    // I1 vs. C2
    drawMatrix.push([qualMatrix[8][0], qualMatrix[2][1]]);

    // J1 vs. D2
    drawMatrix.push([qualMatrix[9][0], qualMatrix[3][1]]);

    // K1 vs. A2
    drawMatrix.push([qualMatrix[10][0], qualMatrix[0][1]]);

    // L1 vs. B2
    drawMatrix.push([qualMatrix[11][0], qualMatrix[1][1]]);

    // M1 vs. G2
    drawMatrix.push([qualMatrix[12][0], qualMatrix[6][1]]);

    // N1 vs. H2
    drawMatrix.push([qualMatrix[13][0], qualMatrix[7][1]]);

    // O1 vs. E2
    drawMatrix.push([qualMatrix[14][0], qualMatrix[4][1]]);

    // P1 vs. F2
    drawMatrix.push([qualMatrix[15][0], qualMatrix[5][1]]);

    // Return the generated draw matrix
    return drawMatrix;
}


function generateDraw(qualMatrix, numGroups, numQuals) {
    if (numGroups === 3 && numQuals === 8) {
        return generateDrawMethod_3_8(qualMatrix);
    } else if (numGroups === 4 && numQuals === 8) {
        return generateDrawMethod_4_8(qualMatrix);
    } else if (numGroups === 4 && numQuals === 16) {
        return generateDrawMethod_4_16(qualMatrix);
    } else if (numGroups === 5 && numQuals === 8) {
        return generateDrawMethod_5_8(qualMatrix);
    } else if (numGroups === 5 && numQuals === 16) {
        return generateDrawMethod_5_16(qualMatrix);
    } else if (numGroups === 6 && numQuals === 8) {
        return generateDrawMethod_6_8(qualMatrix);
    } else if (numGroups === 6 && numQuals === 16) {
        return generateDrawMethod_6_16(qualMatrix);
    } else if (numGroups === 7 && numQuals === 16) {
        return generateDrawMethod_7_16(qualMatrix);
    } else if (numGroups === 8 && numQuals === 16) {
        return generateDrawMethod_8_16(qualMatrix);
    } else if (numGroups === 16 && numQuals === 32) {
        return generateDrawMethod_16_32(qualMatrix);
    }
    // Add more conditions and methods for other combinations here

    // If none of the specified combinations match, return null or an error message
    return null;
}

function showDraw(qualMatrix, numGroups, numQuals) {
    const matchMatrix = generateDraw(qualMatrix, numGroups, numQuals);

    const drawContainer = document.getElementById('draw-container');
    drawContainer.innerHTML = ''; // Clear any previous content

    const drawTable = document.createElement('table');
    drawTable.className = 'draw-table';

    // Create a table row for the header
    const headerRow = document.createElement('tr');
    const headerCell = document.createElement('th');
    headerCell.className = 'draw-header';
    if (numQuals === 16) {
        headerCell.textContent = 'Last 16';
    } else if (numQuals === 8) {
        headerCell.textContent = 'Quarter Finals';
    } else if (numQuals === 4) {
        headerCell.textContent = 'Semi Finals';
    } else {
        headerCell.textContent = 'Draw';
    }
    headerRow.appendChild(headerCell);

    // Loop through the matches and create rows and cells
    for (let i = 0; i < numQuals / 2; i++) {
        const matchRow = document.createElement('tr');

        const matchNumberCell = document.createElement('td');
        matchNumberCell.textContent = (i + 1);
        matchNumberCell.className = 'match-number';
        matchRow.appendChild(matchNumberCell);

        const playerACell = document.createElement('td');
        playerACell.className = 'player';
        const playerAflagDiv = document.createElement('div');
        playerAflagDiv.className = 'player-flag';
        const playerAflag = document.createElement('img');
        playerAflag.className = 'player-flag';
        playerAflag.src = 'images/norge.png';
        playerAflagDiv.appendChild(playerAflag);
        const playerAname = document.createElement('div');
        playerAname.className = 'player-name';
        playerAname.textContent = matchMatrix[i][0];
        playerACell.appendChild(playerAflagDiv);
        playerACell.appendChild(playerAname);
        matchRow.appendChild(playerACell);

        const separatorCell = document.createElement('td');
        separatorCell.className = 'separator';
        const separatorDiv = document.createElement('div');
        separatorDiv.className = 'separatorButton';
        separatorCell.appendChild(separatorDiv);
        matchRow.appendChild(separatorCell);

        const playerBCell = document.createElement('td');
        playerBCell.className = 'player';
        const playerBflagDiv = document.createElement('div');
        playerBflagDiv.className = 'player-flag';
        const playerBflag = document.createElement('img');
        playerBflag.className = 'player-flag';
        playerBflag.src = 'images/norge.png';
        playerBflagDiv.appendChild(playerBflag);
        const playerBname = document.createElement('div');
        playerBname.className = 'player-name';
        playerBname.textContent = matchMatrix[i][1];
        playerBCell.appendChild(playerBflagDiv);
        playerBCell.appendChild(playerBname);
        matchRow.appendChild(playerBCell);

        const timeCell = document.createElement('td');
        timeCell.className = 'time';
        timeCell.textContent = 'Sun 10:00';
        matchRow.appendChild(timeCell);

        const tableNumberCell = document.createElement('td');
        tableNumberCell.textContent = 'Table ' + (i + 1);
        tableNumberCell.className = 'table-number';
        matchRow.appendChild(tableNumberCell);

        matchRow.className = 'match-row'; // Add class to the entire row
        if (i % 2 === 1) {
            matchRow.className = 'match-row-odd';
            matchNumberCell.className = 'match-number-odd';
        }
        drawTable.appendChild(matchRow);
    }
    
    drawContainer.appendChild(headerRow);
    drawContainer.appendChild(drawTable);
}


/*
function showDraw(qualMatrix, numGroups, numQuals) {
    const drawContainer = document.getElementById('draw-container');
    drawContainer.innerHTML = ''; // Clear any previous content

    // Create a paragraph to indicate the stage of the draw
    const drawStage = document.createElement('p');
    drawStage.className = 'draw-stage';

    if (numQuals === 16) {
        drawStage.textContent = 'Last 16';
    } else if (numQuals === 8) {
        drawStage.textContent = 'Quarter Final';
    } else if (numQuals === 4) {
        drawStage.textContent = 'Semi Final';
    } else {
        drawStage.textContent = 'Final';
    }

    drawContainer.appendChild(drawStage);

    // Create a div for each match in the draw
    for (let i = 0; i < numQuals / 2; i++) {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'match';

        const matchNumber = document.createElement('span');
        matchNumber.textContent = 'Match ' + (i + 1);

        const playerA = document.createElement('span');
        playerA.textContent = qualMatrix[i][0];

        const separator = document.createElement('span');
        separator.textContent = ' vs ';

        const playerB = document.createElement('span');
        playerB.textContent = qualMatrix[i][1];

        const tableNumber = document.createElement('span');
        tableNumber.textContent = 'Table: ';

        const matchTime = document.createElement('span');
        matchTime.textContent = 'Time: ';

        matchDiv.appendChild(matchNumber);
        matchDiv.appendChild(playerA);
        matchDiv.appendChild(separator);
        matchDiv.appendChild(playerB);
        matchDiv.appendChild(tableNumber);
        matchDiv.appendChild(matchTime);

        drawContainer.appendChild(matchDiv);
    }
}*/

// Function to show the current page
function showPage(pageToShow) {
    hidePages();
    pageToShow.style.display = 'block';

    // Handle the enlargement of the corresponding flag when the page is active
    flag1.classList.remove('active');
    flag2.classList.remove('active');
    flag3.classList.remove('active');
    if (pageToShow === page1) {
        prevButton.style.display = 'none';
        nextButton.style.display = 'inline-block';
        flag1.classList.add('active');
    } else {
        numGroups = parseInt(groupsCounter.textContent);
        numQs = parseInt(playersSelect.value);
        
        if (pageToShow === page2) {
            prevButton.style.display = 'inline-block';
            nextButton.style.display = 'inline-block';
            flag2.classList.add('active');
            console.log('numGroups = ' + numGroups + ' ; numQs = ' + numQs);
            if (!isMatrixComplete(qualifiersMatrix, numGroups, numQs)) {
                qualifiersMatrix = createEmptyMatrix(numGroups, numQs);
            }
            generateGroupFields(numGroups, numQs); // Generate the input fields for page 2
        } else if (pageToShow === page3) {
            prevButton.style.display = 'inline-block';
            nextButton.style.display = 'none';
            flag3.classList.add('active');
            showDraw(qualifiersMatrix, numGroups, numQs);
        }
    }
}

// Function to handle button clicks
function handleButtonClick(event) {
    if (event.target.id === 'prevButton') {
        if (currentPage > 0) {
            currentPage--;
            showPage(pages[currentPage]);
        }
    } else if (event.target.id === 'nextButton') {
        if (currentPage < pages.length - 1) {
            currentPage++;
            showPage(pages[currentPage]);
        }
    }
}

const correctCombinations = [
    { groups: 3, players: 8 },
    { groups: 4, players: 8 },
    { groups: 4, players: 16 },
    { groups: 5, players: 8 },
    { groups: 5, players: 16 },
    { groups: 6, players: 8 },
    { groups: 6, players: 16 },
    { groups: 7, players: 16 },
    { groups: 8, players: 16 },
    { groups: 16, players: 32 }
];


// Add event listeners to buttons
prevButton.addEventListener('click', handleButtonClick);

nextButton.addEventListener('click', function () {
    if (page1.style.display === 'block') {
        const selectedGroups = parseInt(groupsCounter.textContent);
        const selectedPlayers = parseInt(playersSelect.value);

        const isValidCombination = correctCombinations.some(combination => {
            return combination.groups === selectedGroups && combination.players === selectedPlayers;
        });

        if (!isValidCombination) {
            formatErrorMessage.style.display = 'block';
            return;
        } else {
            formatErrorMessage.style.display = 'none';
        }
    
    } else if (page2.style.display === 'block') {
        saveQualifiers();
        if (!isMatrixComplete(qualifiersMatrix, parseInt(groupsCounter.textContent), parseInt(playersSelect.value))) {
            console.log('Matrix of qualifiers is not complete, please fill in all required information.');
            /*Error message*/
            formatErrorMessagePage2.style.display = 'block';
            return;
        }
        formatErrorMessagePage2.style.display = 'none';

    
    } else if (page3.style.display === 'block') {
        /* something */
    }

    if (currentPage < pages.length - 1) {
        currentPage++;
        showPage(pages[currentPage]);
    }
});


// Show the initial page (page1) when the page loads
let currentPage = 0;
const pages = [page1, page2, page3];
showPage(page1);



// Initial counter value
let counterValue = 1;

// Function to update the counter value element
function updateCounterValue() {
    groupsCounter.textContent = counterValue;
}

// Event listener for the minus button
minusButton.addEventListener('click', function () {
    if (counterValue > 1) {
        counterValue--;
        updateCounterValue();
    }
    playersSelect.value = 'invalid'; // Reset dropdown to default
});

// Event listener for the plus button
plusButton.addEventListener('click', function () {
    if (counterValue < 16) {
        counterValue++;
        updateCounterValue();
    }
    playersSelect.value = 'invalid'; // Reset dropdown to default
});

// Add event listeners to hide the error message on interaction
plusButton.addEventListener('click', hideErrorMessage);
minusButton.addEventListener('click', hideErrorMessage);
playersSelect.addEventListener('change', hideErrorMessage);
groupsPage2.addEventListener('click', hideErrorMessagePage2);

// Function to hide the error message
function hideErrorMessage() {
    formatErrorMessage.style.display = 'none';
}
function hideErrorMessagePage2() {
    formatErrorMessagePage2.style.display = 'none';
}

// Call the function to update the initial counter value
updateCounterValue();
