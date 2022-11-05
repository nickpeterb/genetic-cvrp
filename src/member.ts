import P5 from 'p5';
import { TSPGraph } from './Graph';

// ROUTE
export class Member {
    genes: string[]; // cities order
    distance: number = 0;
    fitness: number = 0;

    // create random "DNA"
    constructor(totalCities: number, genes?: string[]) {
        if (genes !== undefined) this.genes = genes;
        else {
            // create array of random indexes with length totalCities, ranging from 0 to totalCities - 1
            const indexes = Array.from(Array(totalCities).keys());
            const shuffled: number[] = P5.prototype.shuffle(indexes);
            this.genes = shuffled.map((index) => index.toString(16));
        }
    }

    calcFitness(citiesGraph: { [key: string]: { [key: string]: number } }) {
        let distance = 0;
        for (let i = 0; i < this.genes.length - 1; i++) {
            const city = this.genes[i];
            const nextCity = this.genes[i + 1];
            distance += citiesGraph[city][nextCity];
        }
        this.distance = Math.round(distance);
        this.fitness = 1 / (this.distance + 1);
        return this.fitness;
    }

    /** Based on a mutation probability, mutate a part of current DNA */
    mutate(mutationRate: number): void {
        if (Math.random() < mutationRate) {
            const indexA = Math.floor(Math.random() * this.genes.length);
            //const indexB = Math.floor(Math.random() * this.genes.length);
            let indexB = indexA + 1;
            if (indexB >= this.genes.length) indexB = indexA - 1;
            this.swapGenes(indexA, indexB);
        }
    }

    swapGenes(a: number, b: number): void {
        var temp = this.genes[b];
        this.genes[b] = this.genes[a];
        this.genes[a] = temp;
    }
}
