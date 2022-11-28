import P5 from 'p5';
import { VRPGraph } from './Graph';

// ROUTE
export class Member {
    solution: string; // cities order
    distance: number = 0;
    fitness: number = 0;
    fleetSize: number;
    vehicleCapacity: number;

    // create random "DNA"
    constructor(solution: string, vehicleCapacity: number, fleetSize: number) {
        this.solution = solution;
        this.vehicleCapacity = vehicleCapacity;
        this.fleetSize = fleetSize;
    }

    static generateRandomSolution(totalCities: number): string {
        const indexes = Array.from(Array(totalCities).keys());
        indexes.shift(); // Remove 0, i.e the depot node
        const customers: string[] = indexes.map((index) => index.toString());
        const shuffled: number[] = P5.prototype.shuffle(customers);
        return shuffled.join(',');
    }

    /**
     * Parse genes into actual routes
     * @param genes array of nodes not containing depot point(s)
     * @returns array of route arrays, with depot points
     */
    parseSolution(): string[][] {
        const genes = this.solution.split(',');
        const chunkSize = Math.round((genes.length + 1) / this.fleetSize);
        const depot = '0';
        const vehicleRoutes: string[][] = [];
        for (let i = 0; i < genes.length; i += chunkSize) {
            // split in to equal-ish parts (last one will be shorter)
            const route = genes.slice(i, i + chunkSize);
            // bookend with depot node
            if (route[0] !== depot) route.unshift(depot);
            if (route[route.length - 1] !== depot) route.push(depot);
            // push to routes
            vehicleRoutes.push(route);
        }
        return vehicleRoutes;
    }

    calcSolutionFitness(citiesGraph: VRPGraph) {
        // This will give higher (worse) fitness to bad routes, but not exclude them entirely
        const distance = this.calcSolutionDistance(citiesGraph.graph);
        const routes = this.parseSolution();
        let overloads = 0;
        for (const vehicle of routes) {
            // right now demand is the index, but will make a demand array for lookup later
            const totalRouteDemand = vehicle.map((id) => citiesGraph.lookup[id].demand).reduce((prev, curr) => prev + curr, 0);
            if (totalRouteDemand > this.vehicleCapacity) overloads++;
        }
        //return distance + Math.pow(1000, overloads);
        this.distance = distance;
        this.fitness = distance + overloads * 5000; // Arbitrary multiplier
    }

    calcSolutionDistance(citiesGraph: Object) {
        const route = this.parseSolution().flat();
        let distance = 0;
        for (let i = 0; i < route.length - 1; i++) {
            const city = route[i];
            const nextCity = route[i + 1];
            distance += citiesGraph[city][nextCity];
        }
        return distance;
    }

    /** Based on a mutation probability, mutate a part of current DNA */
    mutate(mutationRate: number): void {
        const swapGenes = (genes: string[], a: number, b: number) => {
            const temp = genes[b];
            genes[b] = genes[a];
            genes[a] = temp;
            return genes;
        };

        // Swap two adjacent points
        if (Math.random() < mutationRate) {
            const route = this.solution.split(',');
            const indexA = Math.floor(Math.random() * route.length);
            let indexB = indexA + 1;
            if (indexB >= route.length) indexB = indexA - 1;
            this.solution = swapGenes(route, indexA, indexB).join(',');
            return;
        }

        if (Math.random() < mutationRate) {
            const route = this.solution.split(',');
            const indexA = Math.floor(Math.random() * route.length);
            let indexB = indexA + 1;
            if (indexB >= route.length) indexB = indexA - 1;
            this.solution = swapGenes(route, indexA, indexB).join(',');
            return;
        }

        // Swap two random points (Swap mutation)
        /* if (Math.random() < mutationRate) {
            const route = this.solution.split(',');
            const [indexA, indexB] = this.getRandomIndexes(route.length);
            const mutated = swapGenes(route, indexA, indexB);
            this.solution = mutated.join(',');
            return;
        } */

        /*const reverseSection = (array: string[], start: number, end: number) => {
            const result: string[] = [];
            const slice = array.slice(start, end + 1);
            slice.reverse();
            for (let i = 0; i < array.length; i++) {
                if (i < start || i > end) result.push(array[i]);
                else result.push(slice[i - start]);
            }
            return result;
        };

        // Reverse a random subsection of the route (Inversion mutation)
         if (Math.random() < 0.01) {
            const route = this.solution.split(',');
            const [indexA, indexB] = this.getRandomIndexes(route.length);
            const start = Math.min(indexA, indexB);
            const end = Math.max(indexA, indexB);
            const result = reverseSection(route, start, end);
            this.solution = result.join(',');
            return;
        } */
    }

    /* Utils */

    getRandomIndexes(max: number): [number, number] {
        const indexA = Math.floor(Math.random() * max);
        let indexB = Math.floor(Math.random() * max);
        if (indexA === indexB) indexB >= max - 1 ? indexB-- : indexB++;
        return [indexA, indexB];
    }
}
