import { Member } from './member';

export class Population {
	mutationRate: number; // Mutation rate
	population: Member[] = []; // Array to hold the current population
	matingPool: Member[] = []; // Array which we will use for our "mating pool"
	target: string; // Target phrase
	generations: number = 0; // Number of generations
	finished: boolean = false; // Are we finished evolving?
	perfectScore: number = 1;

	constructor(target: string, mutationRate: number, populationSize: number) {
		this.target = target;
		this.mutationRate = mutationRate;
		for (let i = 0; i < populationSize; i++) {
			this.population.push(new Member(this.target.length));
		}
	}

	/** Set the fitness value for every member of the population */
	getAllFitnessValues(): void {
		console.log();
		for (let i = 0; i < this.population.length; i++) {
			this.population[i].calcFitness(this.target);
		}
	}

	/** Generate a mating pool */
	naturalSelection(): void {
		this.matingPool = []; // Clear the mating pool

		let maxFitness: number = 0;
		let minFitness: number = 1;
		for (const member of this.population) {
			if (member.fitness > maxFitness) maxFitness = member.fitness;
			if (member.fitness < minFitness) minFitness = member.fitness;
		}

		// Based on fitness, each member will get added to the mating pool a certain number of times
		// a higher fitness = more entries to mating pool = more likely to be picked as a parent
		// a lower fitness = fewer entries to mating pool = less likely to be picked as a parent
		for (const member of this.population) {
			const fitness: number = this.mapRange(member.fitness, minFitness, maxFitness, 0, 1); // normalize the fitness value so that most fit member = 1, least fit = 0
			const n = Math.floor(fitness * 100); // Arbitrary multiplier, we can also use monte carlo method

			// push into mating pool n number of times
			for (let j = 0; j < n; j++) {
				this.matingPool.push(member);
			}
		}
	}

	/**
	 * Re-maps a number from one range to another.
	 * e.g. x = 50, in_min = 0, in_max = 100, out_min = 0, out_max = 1
	 * then result = 0.5
	 */
	mapRange(x: number, in_min: number, in_max: number, out_min: number, out_max: number) {
		return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
	}

	/** Create a new generation */
	newGeneration(): void {
		for (let i = 0; i < this.population.length; i++) {
			const a: number = Math.floor(Math.random() * this.matingPool.length);
			const b: number = Math.floor(Math.random() * this.matingPool.length);
			const partnerA = this.matingPool[a];
			const partnerB = this.matingPool[b];
			const child = partnerA.crossover(partnerB);
			child.mutate(this.mutationRate);
			this.population[i] = child;
		}
		this.generations += 1;
	}

	getMostFitMember() {
		const mostFitMember = this.population.reduce(
			(prevMember, currMember) => (currMember.fitness > prevMember.fitness ? currMember : prevMember),
			this.population[0]
		);
		if (mostFitMember.fitness === this.perfectScore) this.finished = true;
		return mostFitMember;
	}
}
