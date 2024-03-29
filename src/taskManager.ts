import { Notice, TFile, getLinkpath, MarkdownRenderer, ItemView, WorkspaceLeaf, Vault } from 'obsidian';

export type Task = {
	points: number,
	order: number,
	workedOnUtcTimestamps: number[], 
	file: TFile
}

export class TaskManager {
	tasks: Task[]

	static timestampsToString(timestamps: number[]) {
		if (timestamps.length == 0) {
			return ""
		}
		return timestamps.toString()
	}

	static async writeTaskStartTimestampToFile(vault: Vault, taskFile: TFile, startedUtcTimestamp: number) {
		var task = await TaskManager.parseTaskFromFile(vault, taskFile)
		task.workedOnUtcTimestamps.push(startedUtcTimestamp)
		var newContents = `Points: ${task.points}\nOrder: ${task.order}\nWorkedOn: ${TaskManager.timestampsToString(task.workedOnUtcTimestamps)}`
		await vault.modify(taskFile, newContents)
	}

	static async updateTaskOrder(vault: Vault, taskFile: TFile, newOrder:number) {
		var task = await TaskManager.parseTaskFromFile(vault, taskFile)
		var newContents = `Points: ${task.points}\nOrder: ${newOrder}\nWorkedOn: ${TaskManager.timestampsToString(task.workedOnUtcTimestamps)}`
		await vault.modify(taskFile, newContents)
	}

	/** Reloads this.tasks */
	async loadTasks(vault: Vault) {
		this.tasks = await TaskManager.calculateTasks(vault)
	}

	static async getTasks(vault: Vault) {
		return await TaskManager.calculateTasks(vault)
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

	private static async calculateTasks(vault: Vault): Promise<Task[]> {
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
		var index = 0
		tasks.sort((a,b) => a.order-b.order)
		tasks.forEach(async (task, _) => {
			var remainingPoints = task.points - task.workedOnUtcTimestamps.length
			var newOrder = task.order
			if (remainingPoints == 0 && task.order < 99999) {
				newOrder = task.order + 99999		
			}
			else {
				newOrder = index
				index += 1
			}

			if (newOrder == task.order) {
				return
			}
			task.order = newOrder
			await TaskManager.updateTaskOrder(app.vault, task.file, newOrder)
		})
		return tasks
	}
}
