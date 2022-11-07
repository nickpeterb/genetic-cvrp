import P5 from 'p5';
import { TSPGraph } from './Graph';
import { Vehicle } from './Vehicle';

// ROUTES
export class Member {
    routes: Vehicle[]; // chromosome
    totalDistance: number = 0;
    fitness: number = 0;

    // create random "DNA"
    constructor(totalCities: number, fleetSize: number, parentDNA?: Vehicle[]) {
        if (parentDNA !== undefined) this.routes = parentDNA;
        else {
            // generate random route
            const indexes = Array.from(Array(totalCities).keys());
            //const shuffledIndexes: number[] = P5.prototype.shuffle(indexes);
            //const randomRoute = shuffledIndexes.map((index) => index.toString(16));
            const route = indexes.map((index) => index.toString(16));
            // split into multiple subroutes
            this.routes = this.splitRoute(route, Math.ceil(totalCities / fleetSize));
        }
    }

    splitRoute(route: string[], chunkSize: number): Vehicle[] {
        const routes: Vehicle[] = [];
        const depot = '0';
        for (let i = 0; i < route.length; i += chunkSize) {
            const subRoute = route.slice(i, i + chunkSize);
            if (subRoute[0] !== depot) subRoute.unshift(depot);
            if (subRoute[subRoute.length - 1] !== depot) subRoute.push(depot);
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
            const randVehicleA = this.getRandomInt(0, this.routes.length);
            const randVehicleB = this.getRandomInt(0, this.routes.length);
            // if (randVehicleA === undefined || randVehicleB === undefined)
            //     console.log('randVehicleA, randVehicleB', randVehicleA, randVehicleB);

            const indexA = this.getRandomInt(1, this.routes[randVehicleA].route.length - 1);
            const indexB = this.getRandomInt(1, this.routes[randVehicleB].route.length - 1);
            //if (indexA === undefined || indexB === undefined) console.log('indexA, indexB', indexA, indexB);

            const geneA = this.routes[randVehicleA].route[indexA];
            const geneB = this.routes[randVehicleB].route[indexB];
            //if (geneA === undefined || geneB === undefined) console.log('geneA, geneB', geneA, geneB);

            this.routes[randVehicleA].route[indexA] = geneB;
            this.routes[randVehicleB].route[indexB] = geneA;
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

    getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
    }
}
