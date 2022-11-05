import { bruteForceTSP } from './brute';
import { Population } from './Population';

export function testInputs() {
    let totalCities: number = 8;
    let populationSize: number = 100;
    let mutationRate = 0.001;
    const canvasDimention = 800;

    const res: number[][] = [];

    for (let n = 1; n <= 100; n += 2) {
        mutationRate = n / 1000;
        const runRes: number[] = [];
        const runs = 20;
        for (let i = 0; i < runs; i++) {
            const population = new Population(totalCities, mutationRate, populationSize, canvasDimention);
            population.getAllFitnessValues();
            //const bruteForceDistance = bruteForceTSP(population.cities);
            //let bestEverDistance: number = population.population[0].distance;
            let gensWithoutImprovement = 0;
            let bestEver = population.getMostFitMember().distance;
            const start = new Date();
            while (population.generations <= 250) {
                population.newGeneration();
                population.getAllFitnessValues();
                const bestDistance = population.getMostFitMember().distance;
                if (bestDistance > bestEver) gensWithoutImprovement++;
                if (bestDistance < bestEver) {
                    bestEver = bestDistance;
                    gensWithoutImprovement = 0;
                }
                //if (bestDistance < bestEverDistance) bestEverDistance = bestDistance;
                if (gensWithoutImprovement === 10) {
                    const end = new Date();
                    runRes.push(population.generations); //end.getTime() - start.getTime()
                    break;
                }
                if (population.generations === 250) {
                    const end = new Date();
                    runRes.push(population.generations); //end.getTime() - start.getTime()
                }
            }
        }
        console.log(runRes);
        const runAvgGen = Math.floor(runRes.reduce((prev, curr) => prev + curr, 0) / runs);
        res.push([runAvgGen, mutationRate]);
    }
    console.log(res.map((arr) => arr[0]).join('\n'));
    console.log(res.map((arr) => arr[1]).join('\n'));
}

export function testGA() {
    const totalCities: number = 9;
    const populationSize: number = 1500;
    const mutationRate = 0.09;
    const canvasDimention = 800; // pixels
    const differences: number[] = [];

    for (let i = 0; i < 500; i++) {
        const population = new Population(totalCities, mutationRate, populationSize, canvasDimention);
        population.getAllFitnessValues();
        const bruteForceDistance = bruteForceTSP(population.cities);
        let bestEverDistance: number = population.population[0].distance;
        //console.log(i);
        while (population.generations <= 250) {
            population.newGeneration();
            population.getAllFitnessValues();
            const bestDistance = population.getMostFitMember().distance;
            if (bestDistance < bestEverDistance) bestEverDistance = bestDistance;
        }
        console.log;
        differences.push(bestEverDistance - bruteForceDistance);
    }
    let underLimit = 0;
    let longer = 0;
    console.log(differences);
    for (const diff of differences) {
        if (Math.abs(diff) <= 5) underLimit++;
        if (diff > 0) longer++;
    }
    const underPercent = (underLimit / differences.length) * 100;
    const longerPercent = (longer / differences.length) * 100;
    console.log(`${underPercent}% of GA solutions were within 5 pixels of the best route`);
    console.log(`${longerPercent}% of GA solutions were worse than the brute force`);
}
