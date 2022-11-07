import { Member } from './Member';
import P5 from 'p5';
import { TSPGraph } from './Graph';
import { Vehicle } from './Vehicle';
//import { annealTSP } from './anneal';

export class Population {
    mutationRate: number; // Mutation rate
    population: Member[] = []; // Array to hold the current population
    generations: number = 0; // Number of generations
    fleetSize: number;

    // just have this be what citiesGraph.xyLookup is
    cities: P5.Vector[] = [];

    citiesGraph: TSPGraph;

    constructor(totalCities: number, fleetSize: number, mutationRate: number, populationSize: number, canvasDimention: number) {
        const p5 = P5.prototype;
        // Create coordiantes for each city
        for (let i = 0; i < totalCities; i++) {
            // Give it some padding
            let x = Math.floor(Math.random() * (canvasDimention - 20));
            let y = Math.floor(Math.random() * (canvasDimention - 20));
            x += 10;
            y += 10;
            const v = p5.createVector(x, y);
            this.cities.push(v);
        }

        let initialPopulation: Member[] = [];
        for (let i = 0; i < populationSize; i++) initialPopulation.push(new Member(totalCities, fleetSize));

        this.population = [...initialPopulation];
        this.fleetSize = fleetSize;
        this.mutationRate = mutationRate;
        this.citiesGraph = new TSPGraph(this.cities);
    }

    /** Set the fitness value for every member of the population */
    getAllFitnessValues(): void {
        let totalFitness = 0;
        for (let i = 0; i < this.population.length; i++) {
            totalFitness += this.population[i].calcFitness(this.citiesGraph?.graph);
        }
        for (let i = 0; i < this.population.length; i++) {
            this.population[i].fitness = this.population[i].fitness / totalFitness;
        }
        //console.log('getAllFitnessValues', this.population);
    }

    /** Create a new generation */
    newGeneration(): void {
        if (this.population.length === 0) console.error('Error Initializing Population');
        //if (this.matingPool.length === 0) console.error('Error Initializing Mating Pool');
        let newPopulation: Member[] = [];
        for (let i = 0; i < this.population.length; i++) {
            const parentA = this.selectMember(this.population);
            const parentB = this.selectMember(this.population);
            const newMember = this.crossover(parentA, parentB);
            newMember.mutate(this.mutationRate);
            newPopulation.push(newMember);
        }
        this.population = [...newPopulation];
        //console.log('newGeneration', this.population);
        this.generations += 1;
    }

    /**
     * Picks a member of the popultion based on its normalized fitness (i.e the its probability)
     * @param population the current population with normalized values
     * @returns a member of the population
     */
    selectMember(population: Member[]): Member {
        let index = 0;
        let random = Math.random();
        while (random > 0) {
            if (index === population.length) return population[index - 1];
            const probability = population[index].fitness;
            random -= probability;
            index++;
        }
        index--;
        return population[index];
    }

    crossover(memberA: Member, memberB: Member) {
        const genesA = memberA.routes.map((vehicle) => vehicle.route).flat();
        const genesB = memberB.routes.map((vehicle) => vehicle.route).flat();
        const start = this.randomInt(0, genesA.length);
        const end = this.randomInt(start + 1, genesA.length);
        const newMemberRoute: string[] = genesA.slice(start, end);
        for (let i = 0; i < genesB.length; i++) {
            const cityIndex = genesB[i];
            if (!newMemberRoute.includes(cityIndex)) newMemberRoute.push(cityIndex);
        }
        /*  for (let i = 0; i < memberA.routes.length; i++) {
            const vehicle = new Vehicle()
            for(const node of newMemberRoute)
        } */
        const newMember = new Member(this.cities.length, this.fleetSize);

        newMember.routes = newMember.splitRoute(newMemberRoute, Math.ceil(this.cities.length / this.fleetSize));
        //const newMember = new Member(this.cities.length, this.fleetSize, vehicles);
        return newMember;
    }

    randomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
    }

    getMostFitMember(): Member {
        let mostFitMember = this.population[0];
        for (const member of this.population) {
            if (member.fitness > mostFitMember.fitness) mostFitMember = member;
        }
        return mostFitMember;
    }
}
