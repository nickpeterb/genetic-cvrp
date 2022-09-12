export class Population {
	members: number[] = [0];

	constructor() {}

	init() {
		console.log('init population');
	}

	addMember(newMem: number): void {
		this.members.push(newMem);
	}
}
