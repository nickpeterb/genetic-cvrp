import P5 from 'p5';
import { Member } from './Member';
import { Population } from './Population';

/*
Mutation is currently high because there is no crossover happening, 
so all genetic varation is coming from mutation. Should be decreased
once crossover is fixed.
*/

const totalCities: number = 10;
const populationSize: number = 1500;
const mutationRate = 0.9;
const canvasDimention = 600; // pixels
const maxGenerations = 200;
const fleetSize = 2;
const chunkSize = Math.round(totalCities / fleetSize);

// Generate initial population
const population = new Population(totalCities, chunkSize, mutationRate, populationSize, canvasDimention);

//const start = new Date();

// Initial generation
population.getAllFitnessValues();

let bestDistance = Number.MAX_SAFE_INTEGER;
let bestRoute: string[][] = [];
let bestFitness = 0;

//let bestEverMember: Member = new Member(totalCities, chunkSize);

// Creating the sketch itself
const sketchSetup = (p5: P5) => {
    // The sketch setup method
    p5.setup = () => {
        // Creating and positioning the canvas
        const canvasHeight = canvasDimention;
        const canvasWidth = canvasDimention;
        const canvas = p5.createCanvas(canvasWidth, canvasHeight);
        canvas.parent('app');

        // Configuring the canvas
        p5.background('#242728');
        p5.textFont('Arial');
        p5.textSize(16);
        //p5.textStyle();
        p5.frameRate(200);
        p5.noLoop();
    };

    const drawCityNumbers = () => {
        // Draw city dots
        sketch.fill('white');
        sketch.stroke('white');
        for (let i = 0; i < population.cities.length; i++) {
            const city = population.cities[i];
            sketch.ellipse(city.x, city.y, 30, 30);
        }

        // Draw city order numbers
        sketch.fill('green');
        sketch.stroke('green');
        /* for (let i = 0; i < member.genes.length; i++) {
            const index = member.genes[i];
            const city = population.cities[index];
            p5.text(i, city.x - 5, city.y + 5);
        } */
        for (let i = 0; i < population.cities.length; i++) {
            const city = population.cities[i];
            const cityHexId = i.toString(16);
            sketch.text(cityHexId, city.x - 5, city.y + 5);
            /*  p5.fill('white');
            p5.text(`${city.x}, ${city.y}`, city.x - 5, city.y + 30); */
        }
    };

    const drawRoute = (route: string[], color: string) => {
        sketch.beginShape();
        sketch.fill(0, 0, 0, 0);
        sketch.stroke(color);
        const routeCities = route.map((hexId) => population.citiesGraph.xyLookup[hexId]);
        for (const city of routeCities) {
            sketch.vertex(city.x, city.y);
        }
        sketch.endShape();
    };

    const drawMember = (member: Member) => {
        const colors = ['red', 'green', 'blue', 'purple', 'yellow'];
        const vehicleRoutes = member.parseGenes();
        for (let i = 0; i < vehicleRoutes.length; i++) {
            const vehicleRoute = vehicleRoutes[i];
            const color = colors[i];
            drawRoute(vehicleRoute, color);
        }
        sketch.text(member.distance, 20, 20);
    };

    // The sketch draw method
    p5.draw = () => {
        population.newGeneration();
        population.getAllFitnessValues();
        //population.normalizeFitnessValues();

        // Get most fit member & check if finished
        const bestMemberOfGeneration = population.getMostFitMember();
        if (bestMemberOfGeneration.distance < bestDistance) {
            bestDistance = bestMemberOfGeneration.distance;
            bestRoute = bestMemberOfGeneration.parseGenes();
            //bestEverMember = bestMemberOfGeneration;
        }
        if (bestMemberOfGeneration.fitness > bestFitness) {
            bestFitness = bestMemberOfGeneration.fitness;
        }

        writeToElem('bestDistance', bestDistance + '');
        writeToElem('generations', population.generations + '');

        p5.background('#242728');
        drawMember(bestMemberOfGeneration);
        drawCityNumbers();

        if (population.generations >= maxGenerations) {
            /* const end = new Date();
            const elapsed = end.getTime() - start.getTime();
            console.log('seconds elapsed', elapsed / 1000); */

            /* p5.background('#242728');
            drawMember(bestEverMember);
            drawCityNumbers(); 
            console.log('bestEverMember route', bestEverMember.parseGenes());
            console.log('bestEverMember distance', bestEverMember.distance);
            writeToElem('bestDistance', bestEverMember.distance + '');
            writeToElem('bestFitness', bestEverMember.fitness + '');*/

            const finalMember = new Member(
                totalCities,
                chunkSize,
                bestRoute.flat().filter((c) => c !== '0')
            );
            finalMember.calcFitness(population.citiesGraph.graph);
            p5.background('#242728');
            drawMember(finalMember);
            drawCityNumbers();
            console.log('bestRoute', bestRoute);
            console.log('bestDistance', bestDistance);
            writeToElem('bestDistance', finalMember.distance + '');

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

//testInputs();
