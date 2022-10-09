import { Population } from './population';

const target = 'To be, or not to be, that is the question.';
const populationSize = 1000; // higher values can solve it in less generations, but with diminishing returns in terms of time
const mutationRate = 0.01; // too low and it gets stuck, too high and its too random

const start = new Date().getTime();

// Generate initial population
let population = new Population(target, mutationRate, populationSize);
// Get initial fitness values
population.getAllFitnessValues();

while (!population.finished) {
	// Generate mating pool
	population.naturalSelection();
	// Create next generation
	population.newGeneration();
	// Calculate fitness
	population.getAllFitnessValues();
	// Get most fit member & check if finished
	const best = population.getMostFitMember();
	console.log(best.genes);
}

const end = new Date().getTime();
console.log('Generations: ', population.generations);
console.log('Execution Time: ', (end - start) / 1000, 'seconds');
