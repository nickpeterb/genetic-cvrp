import { Member } from './Member';
import { City, Population } from './Population';
import { readFile } from './datasets';
import { datasetNames } from './datasetNames';
import * as p5Global from 'p5/global';

(window as any).setup = function () {
    // Creating and positioning the canvas
    const canvas = createCanvas(canvasDimention, canvasDimention);
    canvas.parent('app');

    // Configuring the canvas
    background(backgroundColor);
    textFont('Arial');
    textSize(16);

    frameRate(200);
    // fill('white');
    // text('BIG ANNOYING TEXT', 50, 50);
    noLoop();
};

(window as any).draw = function () {};

function drawPop(population: Population) {
    population.newGeneration();
    population.calcAllFitnessValues();
    const bestMemberOfGeneration = population.getBestMemberOfGeneration();
    if (bestMemberOfGeneration.fitness < bestMember.fitness) bestMember = bestMemberOfGeneration;

    background(backgroundColor);
    drawSolution(bestMemberOfGeneration, population.citiesGraph.lookup);
    drawCityNumbers(population.cities);

    writeToElem('currDistance', bestMemberOfGeneration.distance + '');
    writeToElem('bestDistance', bestMember.distance + '');
    writeToElem('bestFitness', bestMember.fitness + '');
    writeToElem('generations', population.generations + '');

    if (population.generations >= maxGenerations) {
        background(backgroundColor);
        drawSolution(bestMember, population.citiesGraph.lookup);
        drawCityNumbers(population.cities);

        console.log('bestRoute', bestMember.solution);
        console.log(bestMember.parseSolution());
        writeToElem('currDistance', bestMember.distance + '');
        writeToElem('bestDistance', bestMember.distance + '');
        writeToElem('bestFitness', bestMember.fitness + '');
        noLoop();
    }
}

const canvasDimention = 500; // pixels
let yMax = canvasDimention;
const yOffset = 20;
const xOffset = 10;
const scaleFactor = 4.5;

//let isRandom = false;

const translatePoint = (point: City): City => {
    const x = point.x * scaleFactor + xOffset;
    const y = Math.abs(point.y - yMax) * scaleFactor + yOffset;
    return { x, y, demand: point.demand };
};

const drawCityNumbers = (cities: City[]) => {
    // Draw city dots
    fill('white');
    stroke('white');
    for (let i = 0; i < cities.length; i++) {
        const city = translatePoint(cities[i]);
        ellipse(city.x, city.y, 10, 10);
    }
};

const drawRoute = (route: string[], lookup: object, color: string) => {
    beginShape();
    fill(0, 0, 0, 0);
    stroke(color);
    const routeCities = route.map((id) => lookup[parseInt(id)]);
    for (const city of routeCities) {
        const c = translatePoint(city);
        vertex(c.x, c.y);
    }
    endShape();
};

const drawSolution = (member: Member, lookup: object) => {
    const colors = ['red', 'green', 'dodgerblue', 'blueviolet', 'yellow', 'orange', 'lightbrown', 'darkgrey', 'pink', 'magenta', 'white'];
    const vehicleRoutes = member.parseSolution();
    for (let i = 0; i < vehicleRoutes.length; i++) {
        const vehicleRoute = vehicleRoutes[i];
        const color = colors[i];
        drawRoute(vehicleRoute, lookup, color);
    }
};

function writeToElem(id: string, txt: string) {
    const elem = document.getElementById(id);
    if (elem !== null) elem.innerHTML = txt;
}

function selectDataset(datasetName) {
    if (datasetName === 'none') {
        background(backgroundColor);
        return;
    }
    selectedDataset = datasetName;

    readFile(datasetName).then((dataset) => {
        console.log(dataset);

        writeToElem('optimalDistance', dataset.optimum + '');
        yMax = Math.max(...dataset.cities.map((c) => c.y));

        const { cities } = dataset;
        drawCityNumbers(cities);
    });
}

// Global variables
let selectedDataset = 'none';

const backgroundColor = '#242728';

// VRP Settings
let totalCities: number = 20; // including depot node
let fleetSize = 2;
let vehicleCapacity = (totalCities * (totalCities + 1)) / 2;

// GA Settings
const populationSize: number = 700;
const mutationRate = 0.2;
const maxGenerations = 500;
const tournamentSize = 2;

let bestMember: Member = new Member('', 0, 0);
bestMember.fitness = Number.MAX_SAFE_INTEGER;

function reset() {
    noLoop();
    background(backgroundColor);
    (window as any).draw = function () {};
    loop();
    noLoop();

    writeToElem('currDistance', '');
    writeToElem('bestDistance', '');
    writeToElem('bestFitness', '');
    writeToElem('generations', '');
    writeToElem('optimalDistance', '');
}

window.onload = function () {
    var select: any = document.getElementById('select-dataset');
    for (const name of datasetNames) {
        var option = document.createElement('option');
        option.text = option.value = name;
        select.add(option, 0);
    }

    (document.getElementById('select-dataset') as any).addEventListener('change', function () {
        reset();
        selectDataset(this.value);
    });
};

(window as any).run = function () {
    readFile(selectedDataset).then((dataset) => {
        const { cities, fleetSize, capacity } = dataset;

        const population = new Population(cities, populationSize, mutationRate, tournamentSize, fleetSize, capacity);
        population.calcAllFitnessValues();

        (window as any).draw = function () {
            drawPop(population);
        };
        loop();
    });
};

(window as any).randomize = function () {
    reset();
    writeToElem('optimalDistance', 'N/A');

    const randomCities = Population.generateRandomCities(totalCities);
    yMax = Math.max(...randomCities.map((c) => c.y));
    const population = new Population(randomCities, populationSize, mutationRate, tournamentSize, fleetSize, vehicleCapacity);
    population.calcAllFitnessValues();

    (window as any).draw = function () {
        drawPop(population);
    };
    loop();
};
