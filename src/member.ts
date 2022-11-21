import P5 from 'p5';

// ROUTE
export class Member {
    genes: string[]; // cities order
    distance: number = 0;
    fitness: number = 0;
    chunkSize: number;

    // create random "DNA"
    constructor(totalCities: number, chunkSize: number, genes?: string[]) {
        this.chunkSize = chunkSize;
        if (genes !== undefined) this.genes = genes;
        else {
            // create array of random indexes with length totalCities, ranging from 0 to totalCities - 1
            const indexes = Array.from(Array(totalCities).keys());
            indexes.shift(); // Remove 0, i.e the depot node
            const nodes: string[] = indexes.map((index) => index.toString(16));
            const shuffled: string[] = P5.prototype.shuffle(nodes);
            this.genes = shuffled;
        }
    }

    /**
     * Parse genes into actual routes
     * @param genes array of nodes not containing depot point(s)
     * @returns array of route arrays, with depot points
     */
    parseGenes() {
        const depot = '0';
        const vehicleRoutes: string[][] = [];
        for (let i = 0; i < this.genes.length; i += this.chunkSize) {
            // split in to equal-ish parts (last one will be shorter)
            const route = this.genes.slice(i, i + this.chunkSize);
            // bookend with depot node
            if (route[0] !== depot) route.unshift(depot);
            if (route[route.length - 1] !== depot) route.push(depot);
            // push to routes
            vehicleRoutes.push(route);
        }
        return vehicleRoutes;
    }

    calcFitness(citiesGraph: { [key: string]: { [key: string]: number } }) {
        let distance = 0;
        const genes = this.parseGenes().flat(); // squash parsed genes to include depots, e.g. ['0', '1', '2', '0', '0', '3', '4', '0' ]
        for (let i = 0; i < genes.length - 1; i++) {
            const city = genes[i];
            const nextCity = genes[i + 1];
            distance += citiesGraph[city][nextCity];
        }
        this.distance = distance;
        this.fitness = 1 / (distance + 1);
        return this.fitness;
    }

    /** Based on a mutation probability, mutate a part of current DNA */
    mutate(mutationRate: number): void {
        if (Math.random() < mutationRate) {
            const indexA = Math.floor(Math.random() * this.genes.length);
            const indexB = Math.floor(Math.random() * this.genes.length);
            //let indexB = indexA + 1;
            //if (indexB >= this.genes.length) indexB = indexA - 1;
            this.swapGenes(indexA, indexB);
        }
    }

    swapGenes(a: number, b: number): void {
        var temp = this.genes[b];
        this.genes[b] = this.genes[a];
        this.genes[a] = temp;
    }
}
