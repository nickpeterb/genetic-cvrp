import { datasetNames } from './datasetNames';
import { readFile } from './datasets';
import { Member } from './Member';
import { City, Population } from './Population';

export async function testDatasets() {
    const optimums: number[] = [];
    const results: number[] = [];
    const margins: any[] = [];
    const valids: boolean[] = [];
    console.log('starting test');
    for (const name of datasetNames) {
        const dataset = await readFile(name);
        const { cities, fleetSize, capacity, optimum } = dataset;
        const mutationRate = 0.2;
        const tournamentSize = 2;
        const [bestDist, bestFit] = runGA(cities, 500, mutationRate, tournamentSize, fleetSize, capacity, optimum);
        optimums.push(optimum);
        results.push(bestDist);
        margins.push(bestDist - optimum);
        valids.push(bestDist === bestFit);
        console.log(name, bestDist - optimum);
    }
    console.log(optimums);
    console.log(results);
    console.log(margins);
    console.log(valids);
}

export async function testGenerationsVsPopulationSize() {
    const dataset = await readFile(datasetNames[0]);
    console.log(dataset);
    const { cities, fleetSize, capacity, optimum } = dataset;
    // GA Settings
    //const populationSize: number = 1500;
    const mutationRate = 0.3;
    const maxGenerations = 500;
    const tournamentSize = 2;

    for (let popSize = 50; popSize <= 1500; popSize += 50) {
        const generationsNeeded: number[] = [];
        for (let i = 0; i < 5; i++) {
            const totalGens = runGA(cities, popSize, mutationRate, tournamentSize, fleetSize, capacity, optimum);
            //generationsNeeded.push(totalGens);
        }
        const averageGenrations = generationsNeeded.reduce((prev, curr) => prev + curr, 0) / generationsNeeded.length;
        console.log(averageGenrations, popSize);
    }
}

function runGA(
    cities: City[],
    populationSize: number,
    mutationRate: number,
    tournamentSize: number,
    fleetSize: number,
    vehicleCapacity: number,
    optimalDistance: number
) {
    const population = new Population(cities, populationSize, mutationRate, tournamentSize, fleetSize, vehicleCapacity);
    population.calcAllFitnessValues();

    let bestMember = population.getBestMemberOfGeneration();

    while (/* bestMember.distance > optimalDistance + 200 &&  */ population.generations <= 600) {
        population.newGeneration();
        population.calcAllFitnessValues();
        const bestMemberOfGeneration = population.getBestMemberOfGeneration();

        if (bestMemberOfGeneration.fitness < bestMember.fitness) bestMember = bestMemberOfGeneration;
    }

    //if (bestMember.distance !== bestMember.fitness) return bestMember.distance - optimalDistance + ' dnf';
    return [bestMember.distance, bestMember.fitness];
}
