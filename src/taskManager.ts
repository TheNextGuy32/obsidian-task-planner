import { Notice, TFile, getLinkpath, MarkdownRenderer, ItemView, WorkspaceLeaf, Vault } from 'obsidian';

export type Task = {
	points: number,
	order: number,
	workedOnUtcTimestamps: number[], 
	file: TFile
}

export class TaskManager {
	tasks: Task[]

	static async writeTaskStartTimestampToFile(vault: Vault, taskFile: TFile, startedUtcTimestamp: number) {
		var task = await TaskManager.parseTaskFromFile(vault, taskFile)
		task.workedOnUtcTimestamps.push(startedUtcTimestamp)
		var newContents = `Points: ${task.points}\nOrder: ${task.order}\nWorkedOn: ${task.workedOnUtcTimestamps}`
		await vault.modify(taskFile, newContents)
	}

	/** Reloads this.tasks */
	async loadTasks(vault: Vault) {
		this.tasks = await this.calculateTasks(vault)
	}

	static async parseTaskFromFile(vault:Vault, file:TFile): Promise<Task> {
		const contents:string = await vault.read(file)
		var points = 0
		var order = 0
		var workedOnUtcTimestamps:number[] = []
		
		var lines = contents.split("\n")
		for (var l in lines) {
			var line = lines[l]
			if (line.startsWith("Points:")) {
				points = Number(line.split("Points:")[1].trim())
			}
			if (line.startsWith("Order:")) {
				order = Number(line.split("Order:")[1].trim())
			}
			if (line.startsWith("WorkedOn:")) {
				workedOnUtcTimestamps = line.split("WorkedOn:")[1].trim().split(",").map((t)=> Number(t))
			}
		}
		var task:Task = {
			workedOnUtcTimestamps: workedOnUtcTimestamps,
			points: points,
			order: order,
			file: file
		}
		return task
	}

	private async calculateTasks(vault: Vault): Promise<Task[]> {
		var files:TFile[] = vault.getMarkdownFiles()
		var tasks:Task[] = []
		for (var i = 0 ; i < files.length; i++) {
			var file:TFile = files[i]
			if (!file.path.startsWith("05-Tasks")) {
				continue
			}
			var task = await TaskManager.parseTaskFromFile(vault, file)
			tasks.push(task)
		}
		tasks.sort((a,b) => a.order-b.order)
		return tasks
	}
}
