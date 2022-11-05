import { Member } from './Member';
import P5 from 'p5';
import { TSPGraph } from './Graph';
//import { annealTSP } from './anneal';

export class Population {
    mutationRate: number; // Mutation rate
    population: Member[] = []; // Array to hold the current population
    generations: number = 0; // Number of generations
    // isFinished: boolean = false; // Are we finished evolving?

    // just have this be what citiesGraph.xyLookup is
    cities: P5.Vector[] = [];

    citiesGraph: TSPGraph = new TSPGraph([]);

    //annealingSolution: number[] = [];

    constructor(totalCities: number, mutationRate: number, populationSize: number, canvasDimention: number) {
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
        for (let i = 0; i < populationSize; i++) initialPopulation.push(new Member(totalCities));

        this.population = [...initialPopulation];

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
            //const newMember = this.selectMember(this.population);
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
            const probability = population[index].fitness;
            random -= probability;
            index++;
        }
        index--;
        return population[index];
    }

    crossover(memberA: Member, memberB: Member) {
        const start = this.randomInt(0, memberA.genes.length);
        const end = this.randomInt(start + 1, memberA.genes.length);
        const newMemberRoute: string[] = memberA.genes.slice(start, end);
        for (let i = 0; i < memberB.genes.length; i++) {
            const cityIndex = memberB.genes[i];
            if (!newMemberRoute.includes(cityIndex)) newMemberRoute.push(cityIndex);
        }
        const newMember = new Member(this.cities.length, newMemberRoute);
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
