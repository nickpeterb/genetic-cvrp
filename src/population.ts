import { Member } from './Member';
import { VRPGraph } from './Graph';

export interface City {
    x: number;
    y: number;
    demand: number;
}

export class Population {
    // GA Settings
    population: Member[] = []; // Array to hold the current population
    mutationRate: number; // Mutation rate
    tournamentSize: number;
    generations: number = 0; // Number of generations

    // VRP Settings
    fleetSize: number;
    vehicleCapacity: number;

    cities: City[];
    citiesGraph: VRPGraph;

    constructor(
        cities: City[],
        populationSize: number,
        mutationRate: number,
        tournamentSize: number,
        fleetSize: number,
        vehicleCapacity: number
    ) {
        for (let i = 0; i < populationSize; i++) {
            const randomSolution = Member.generateRandomSolution(cities.length);
            this.population.push(new Member(randomSolution, vehicleCapacity, fleetSize));
        }
        this.cities = cities;
        this.mutationRate = mutationRate;
        this.tournamentSize = tournamentSize;
        this.fleetSize = fleetSize;
        this.citiesGraph = new VRPGraph(this.cities);
        this.vehicleCapacity = vehicleCapacity;
    }

    static generateRandomCities(totalCities: number, canvasDimention: number) {
        const cities: City[] = [];
        const depotCenter: City = { x: canvasDimention / 2, y: canvasDimention / 2, demand: 0 };
        cities.push(depotCenter);
        for (let i = 1; i < totalCities; i++) {
            // Give it some padding
            let x = Math.floor(Math.random() * (canvasDimention - 20));
            let y = Math.floor(Math.random() * (canvasDimention - 20));
            x += 10;
            y += 10;
            const v = { x, y, demand: i };
            cities.push(v);
        }
        return cities;
    }

    /** Set the fitness value for every member of the population */
    calcAllFitnessValues(): void {
        for (let i = 0; i < this.population.length; i++) {
            this.population[i].calcSolutionFitness(this.citiesGraph);
        }
    }

    /** Create a new generation */
    newGeneration(): void {
        if (this.population.length === 0) console.error('Error Initializing Population');
        let newPopulation: Member[] = [];
        for (let i = 0; i < this.population.length; i++) {
            const parentA = this.tournamentSelection();
            const parentB = this.tournamentSelection();
            const newMember = this.onePointcrossover(parentA, parentB);
            newMember.mutate(this.mutationRate);
            newPopulation.push(newMember);
        }
        this.population = [...newPopulation];
        this.generations += 1;
    }

    tournamentSelection() {
        const randomIndexes: number[] = [];
        for (let i = 0; i < this.tournamentSize; i++) {
            let random = Math.floor(Math.random() * this.population.length);
            while (randomIndexes.includes(random)) {
                random = Math.floor(Math.random() * this.population.length);
            }
            randomIndexes.push(random);
        }
        const pickedMembers = this.population.filter((_, i) => randomIndexes.includes(i));
        pickedMembers.sort((memberA, memberB) => memberA.fitness - memberB.fitness);
        return pickedMembers[0]; // Winner
    }

    onePointcrossover(parentA: Member, parentB: Member): Member {
        const parentARoute = parentA.solution.split(',');
        const parentBRoute = parentB.solution.split(',');
        const point = Math.floor(Math.random() * parentARoute.length);
        const child = parentARoute.slice(0, point);
        for (let i = 0; i < parentBRoute.length; i++) {
            const city = parentBRoute[i];
            if (!child.includes(city)) child.push(city);
        }
        return new Member(child.join(','), this.vehicleCapacity, this.fleetSize);
    }

    getBestMemberOfGeneration(): Member {
        const sorted = [...this.population].sort((memberA, memberB) => memberA.fitness - memberB.fitness);
        return sorted[0];
    }
}
