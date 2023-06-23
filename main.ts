import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile,Vault } from 'obsidian';
import CheckinDatabaseFileManager from "./src/checkinDatabaseFileManager"
import TaskView from 'src/taskView';
import { TaskManager } from 'src/taskManager';

export default class N24Checkin extends Plugin {
	checkinDatabaseFileManager: CheckinDatabaseFileManager
	taskManager: TaskManager
	checkinStatusBarElement: HTMLElement
	taskView: TaskView
	async findCheckinDatabaseFile(vault: Vault) {
		var files:TFile[] = vault.getMarkdownFiles()
		for(var f in files) {
			if (files[f].basename != "checkin") {
				continue;
			}
			return files[f]
		}
		return null
	}

	async activateView() {
		
	}

	async loadCheckinDatabaseFileManager(vault: Vault) {
		var checkinDatabaseFile = await this.findCheckinDatabaseFile(vault)
		if (checkinDatabaseFile == null) {
			new Notice('Error: Create checkin file.');
			return 
		}
		this.checkinDatabaseFileManager = new CheckinDatabaseFileManager(vault, checkinDatabaseFile);
	}
	async loadTasks(vault: Vault) {
		this.taskManager = new TaskManager()
		this.taskManager.loadTasks(vault);
	}


	async setCheckinStatusBarAndNotice(vault: Vault) {
		var checkinName = await this.checkinDatabaseFileManager.calculateDayOfWeekName()
		var endOfCheckinDate = await this.checkinDatabaseFileManager.getCheckinEndUtcMillsecondTimestamp();
		var endOfCheckinTime = await this.checkinDatabaseFileManager.getEndOfCurrentCheckinTime(endOfCheckinDate)
		
		new Notice('Checkin started. It is ' + checkinName + " " + endOfCheckinTime + ".");
		this.checkinStatusBarElement.setText(checkinName + " " + endOfCheckinTime);
	}

	async updateTasksWithUpdatedCheckinsList(vault:Vault){ 
		var checkinTimestamps = await this.checkinDatabaseFileManager.getCheckins()
		for(var w in checkinTimestamps) {
			var checkinTimestamp = checkinTimestamps[w]
			for(var t in this.taskManager.tasks) {
				var task = this.taskManager.tasks[t]

				var hasTimestamp = false
				for(var workedOnUtcTimestamp of task.workedOnUtcTimestamps) {
					if(workedOnUtcTimestamp == checkinTimestamp) {
						console.log(`Task ${t} already has checkin ${w}.`)
						hasTimestamp = true
						break
					}
				}
				if(hasTimestamp) {
					break
				}

				if(task.workedOnUtcTimestamps.length == task.points) {
					console.log(`Task ${t} full and cannot take checkin ${w}.`)
					continue
				}

				
				await TaskManager.writeTaskStartTimestampToFile(vault, task.file, checkinTimestamp);
				await this.taskManager.loadTasks(vault)
				console.log(`Adding checkin ${w} to task ${t}.`)
				break
			}
		}
	}

	async startCheckin(vault: Vault) {
		var currentTimestamp = new Date().getTime();
		await this.checkinDatabaseFileManager.addCheckin(currentTimestamp)
		var checkinName = await this.checkinDatabaseFileManager.calculateDayOfWeekName()
			
		await this.updateTasksWithUpdatedCheckinsList(vault);
		await this.taskView.recalcTasks();

		this.checkinStatusBarElement.setText(checkinName);
		new Notice('Checkin started. It is ' + checkinName + ".");
	}

	async startRestday(vault: Vault) {
		new Notice('Restday started.');
	}

	async createTaskView() {
		
		this.registerView(
			TaskView.taskViewType,
			(leaf) => {
				this.taskView = new TaskView(leaf, this.taskManager)
				return this.taskView
			}
		);

		this.app.workspace.detachLeavesOfType(TaskView.taskViewType);
	
		await this.app.workspace.getRightLeaf(false).setViewState({
			type: TaskView.taskViewType,
			active: true,
		});
	
		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(TaskView.taskViewType)[0]
		);
	}

	async onload() {
		this.checkinStatusBarElement = this.addStatusBarItem();

		var vault = this.app.vault
		await this.loadCheckinDatabaseFileManager(vault);
		await this.loadTasks(vault);

		await this.createTaskView()
		await this.setCheckinStatusBarAndNotice(vault);
		
		await this.updateTasksWithUpdatedCheckinsList(vault);

		this.addCommand({
			id: 'what-checkin',
			name: 'What Checkin?',
			callback: () => this.setCheckinStatusBarAndNotice(vault)
		});
		this.addCommand({
			id: 'checkin',
			name: 'Start Checkin',
			callback: () => this.startCheckin(vault)
		});
		this.addCommand({
			id: 'restday',
			name: 'Start Restday',
			editorCallback: () => this.startRestday(vault)
		});
	}

	onunload() {

	}	
}
