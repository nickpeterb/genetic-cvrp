import P5 from 'p5';
import { TSPGraph } from './Graph';
import { Vehicle } from './Vehicle';

// ROUTES
export class Member {
    routes: Vehicle[]; // chromosome
    totalDistance: number = 0;
    fitness: number = 0;

    // create random "DNA"
    constructor(totalCities: number, fleetSize: number, routes?: Vehicle[]) {
        if (routes !== undefined) this.routes = routes;
        else {
            // generate random route
            const indexes = Array.from(Array(totalCities).keys());
            const shuffledIndexes: number[] = P5.prototype.shuffle(indexes);
            const randomRoute = shuffledIndexes.map((index) => index.toString(16));
            // split into multiple subroutes
            this.routes = this.splitRoute(randomRoute, totalCities / fleetSize);
        }
    }

    splitRoute(route: string[], chunkSize: number): Vehicle[] {
        const routes: Vehicle[] = [];
        for (let i = 0; i < route.length; i += chunkSize) {
            const subRoute = route.slice(i, i + chunkSize);
            const vehicle = new Vehicle(subRoute);
            routes.push(vehicle);
        }
        return routes;
    }

    calcFitness(citiesGraph: { [key: string]: { [key: string]: number } }) {
        let totalDistance = 0;
        for (const vehicle of this.routes) {
            totalDistance += vehicle.calcDistance(citiesGraph);
        }
        this.totalDistance = totalDistance;
        const fitness = 1 / (totalDistance + 1);
        this.fitness = fitness;
        return fitness;
    }

    /** Based on a mutation probability, mutate a part of current DNA */
    mutate(mutationRate: number): void {
        if (Math.random() < mutationRate) {
            const randVehicleA = Math.floor(Math.random() * this.routes.length);
            const randVehicleB = Math.floor(Math.random() * this.routes.length);

            const indexA = Math.floor(Math.random() * this.routes[randVehicleA].route.length);
            const indexB = Math.floor(Math.random() * this.routes[randVehicleB].route.length);

            const geneA = this.routes[randVehicleA].route[indexA];
            const geneB = this.routes[randVehicleB].route[indexB];

            this.routes[randVehicleA].route[indexA] = geneB;
            this.routes[randVehicleB].route[indexB] = geneA;
            // let indexB = indexA + 1;
            // if (indexB >= this.genes.length) indexB = indexA - 1;
        }
    }

    // maybe make it swap adjacent points, even if they are on different routes
    /*  mutate(mutationRate: number): void {
        if (Math.random() < mutationRate) {
            //console.log([...this.routes.map((v) => [...v.route])]);
            let totalNodes = 0;
            for (const vehicle of this.routes) for (const node of vehicle.route) totalNodes++;
            const indexA = Math.floor(Math.random() * totalNodes);
            let indexB = indexA + 1;
            if (indexB >= totalNodes) indexB = indexA - 1;

            const chunkLen = this.routes[0].route.length;
            const vehicleIndexA = Math.floor(indexA / chunkLen);
            const vehicleIndexB = Math.floor(indexB / chunkLen);
            const cityIndexA = indexA < chunkLen ? indexA : indexA - chunkLen * vehicleIndexA;
            const cityIndexB = indexB < chunkLen ? indexB : indexB - chunkLen * vehicleIndexB;

            const geneA = this.routes[vehicleIndexA].route[cityIndexA];
            const geneB = this.routes[vehicleIndexB].route[cityIndexB];

            this.routes[vehicleIndexA].route[cityIndexA] = geneB;
            this.routes[vehicleIndexB].route[cityIndexB] = geneA;
            //console.log([...this.routes.map((v) => [...v.route])]);
        }
    } */

    /* swapGenes(a: number, b: number): void {
        var temp = this.genes[b];
        this.genes[b] = this.genes[a];
        this.genes[a] = temp;
    } */
}
