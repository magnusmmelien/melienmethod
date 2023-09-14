// Define the Club class
class Club {
    constructor(name, size = 0) {
        this.name = name;
        this.size = size;
    }

    // Get the number of members in the club
    getSize() { return this.size; }
    setSize(s) { this.size = s; }
    incSize() { this.size += 1; }
    getName() { return this.name; }
}

export default Club;
