const CHARACHTER_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz.,';

// DNA (genotype)
export class Member {
	genes: string;
	fitness: number = 0;

	// create random "DNA"
	constructor(num: number) {
		this.genes = this.randString(num);
	}

	calcFitness(target: string): void {
		let score: number = 0;
		for (let i = 0; i < this.genes.length; i++) {
			if (this.genes[i] === target[i]) {
				score++;
			}
		}
		this.fitness = score / target.length;
	}

	// Could be put this in the population.ts, taking Members as arguments
	crossover(partner: Member): Member {
		let child = new Member(this.genes.length);
		const midpoint: number = Math.floor(Math.random() * this.genes.length);
		child.genes = this.genes.slice(0, midpoint) + partner.genes.slice(midpoint);
		return child;
	}

	// Based on a mutation probability, mutate the current DNA
	mutate(mutationRate: number): void {
		for (let i = 0; i < this.genes.length; i++) {
			if (Math.random() < mutationRate) {
				let mutated = this.genes.split('');
				mutated[i] = this.randChar();
				this.genes = mutated.join('');
			}
		}
	}

	// Utils
	randString(length: number): string {
		var result = '';
		for (var i = 0; i < length; i++) {
			result += this.randChar();
		}
		return result;
	}

	randChar(): string {
		return CHARACHTER_SET.charAt(Math.floor(Math.random() * CHARACHTER_SET.length));
	}
}
