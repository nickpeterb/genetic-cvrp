import P5 from 'p5';
import { Member } from './Member';
import { City, Population } from './Population';
import { readFile, testReadFile } from './datasets';

const backgroundColor = '#242728';

// VRP Settings
let totalCities: number = 31; // including depot node
let fleetSize = 5;
let vehicleCapacity = 155;
const canvasDimention = 600; // pixels

// GA Settings
const populationSize: number = 1500;
const mutationRate = 0.3;
const maxGenerations = 500;
const tournamentSize = 2;

let bestMember: Member = new Member('', 0, 0);
bestMember.fitness = Number.MAX_SAFE_INTEGER;

let yMax = canvasDimention;
const yOffset = 20;
const xOffset = 20;
const scaleFactor = 4.5;

let translatePoint = (point: City): City => {
    return point;
};

let population = new Population([], 0, 0, 0, 0, 0);

readFile().then((dataset) => {
    console.log(dataset);

    writeToElem('optimalDistance', dataset.optimum + '');

    const { cities, fleetSize, capacity } = dataset;
    population = new Population(cities, populationSize, mutationRate, tournamentSize, fleetSize, capacity);
    population.calcAllFitnessValues();

    yMax = Math.max(...dataset.cities.map((c) => c.y));
    translatePoint = (point: City): City => {
        const x = point.x * scaleFactor + xOffset;
        const y = (Math.abs(point.y - yMax) + yOffset) * scaleFactor;
        return { x, y, demand: point.demand };
    };
});

//const randomCities = Population.generateRandomCities(totalCities, canvasDimention);
//population = new Population(randomCities, mutationRate, tournamentSize, fleetSize, vehicleCapacity);
//population.generateInitialPopulation(populationSize);
//population.calcAllFitnessValues();

// Creating the sketch itself
const sketchSetup = (p5: P5) => {
    // The sketch setup method
    p5.setup = () => {
        // Creating and positioning the canvas
        const canvas = p5.createCanvas(canvasDimention, canvasDimention);
        canvas.parent('app');

        // Configuring the canvas
        p5.background(backgroundColor);
        p5.textFont('Arial');
        p5.textSize(16);
        //p5.textStyle();
        p5.frameRate(200);
        p5.noLoop();
    };

    const drawCityNumbers = (cities: City[]) => {
        // Draw city dots
        sketch.fill('white');
        sketch.stroke('white');
        for (let i = 0; i < cities.length; i++) {
            const city = translatePoint(cities[i]);
            sketch.ellipse(city.x, city.y, 10, 10);
        }

        //Draw city order numbers
        // sketch.fill('white');
        // sketch.stroke('white');
        // for (let i = 0; i < cities.length; i++) {
        //     const city = translatePoint(cities[i]);
        //     const cityHexId = i.toString();
        //     sketch.text(cityHexId, city.x, city.y);
        // }
    };

    const drawRoute = (route: string[], color: string) => {
        sketch.beginShape();
        sketch.fill(0, 0, 0, 0);
        sketch.stroke(color);
        const routeCities = route.map((id) => population.citiesGraph.lookup[parseInt(id)]);
        for (const city of routeCities) {
            const c = translatePoint(city);
            sketch.vertex(c.x, c.y);
        }
        sketch.endShape();
    };

    const drawSolution = (member: Member) => {
        const colors = ['red', 'green', 'dodgerblue', 'blueviolet', 'yellow', 'orange'];
        const vehicleRoutes = member.parseSolution();
        for (let i = 0; i < vehicleRoutes.length; i++) {
            const vehicleRoute = vehicleRoutes[i];
            const color = colors[i];
            drawRoute(vehicleRoute, color);
        }
    };

    // The sketch draw method
    p5.draw = () => {
        /* p5.translate(0, canvasDimention);
        p5.scale(1, -1); */

        if (!p5.isLooping()) {
            drawCityNumbers(population.cities);
            return;
        }

        population.newGeneration();
        population.calcAllFitnessValues();
        const bestMemberOfGeneration = population.getBestMemberOfGeneration();

        if (bestMemberOfGeneration.fitness < bestMember.fitness) bestMember = bestMemberOfGeneration;

        writeToElem('currDistance', bestMemberOfGeneration.distance + '');
        writeToElem('bestDistance', bestMember.distance + '');
        writeToElem('bestFitness', bestMember.fitness + '');
        writeToElem('generations', population.generations + '');

        p5.background(backgroundColor);
        drawSolution(bestMemberOfGeneration);
        drawCityNumbers(population.cities);

        if (population.generations >= maxGenerations) {
            p5.background(backgroundColor);

            drawSolution(bestMember);
            drawCityNumbers(population.cities);

            console.log('bestRoute', bestMember.solution);
            console.log(bestMember.parseSolution());
            writeToElem('currDistance', bestMember.distance + '');
            writeToElem('bestDistance', bestMember.distance + '');
            writeToElem('bestFitness', bestMember.fitness + '');

            p5.noLoop();
        }
    };
};

function writeToElem(id: string, txt: string) {
    const elem = document.getElementById(id);
    if (elem !== null) elem.innerHTML = txt;
}

const sketch = new P5(sketchSetup);

(window as any).run = function () {
    sketch.loop();
};
