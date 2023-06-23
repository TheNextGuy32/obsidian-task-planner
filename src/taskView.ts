import { Notice, TFile, getLinkpath, MarkdownRenderer, ItemView, WorkspaceLeaf, Vault } from 'obsidian';
import { TaskManager, Task } from './taskManager';

// import taskUtilities from './taskUtilities';

export default class TaskView extends ItemView {
    static taskViewType = "task-view"
	taskManager: TaskManager
    constructor(leaf: WorkspaceLeaf, taskManager: TaskManager) {
		super(leaf);
		this.taskManager = taskManager
	}
  
	getViewType() {
	  return TaskView.taskViewType
	}
  
	getDisplayText() {
		return "Task View"
	}

	async onOpen() {
		this.renderTasks()
	}

	async renderTasks() {
		const container = this.containerEl.children[1];

		container.empty();
		await this.taskManager.loadTasks(this.app.vault)
		var tasks:Task[] = this.taskManager.tasks

		container.createEl("h4", { text: "Next 5 Days" });
		var weekPointTotal = 5
		for(var task of tasks) {
			var remainingPoints = task.points - task.workedOnUtcTimestamps.length
			if (remainingPoints == 0) {
				continue
			}
			var pointsLeftOverAfterTask = weekPointTotal - remainingPoints
			var thisPointTotal = pointsLeftOverAfterTask < 0 ? `${remainingPoints + pointsLeftOverAfterTask} of ${remainingPoints}pts`  : `${remainingPoints}pts`
			
			weekPointTotal -= remainingPoints
			var message = thisPointTotal + " " + task.file.basename
			container.createEl("p", { text: message });
			if (weekPointTotal <= 0) {
				break;
			}
		}
		container.createEl("h4", { text: "Tasks" });
		
		for(var task of tasks) {
			var remainingPoints = task.points - task.workedOnUtcTimestamps.length
			if (remainingPoints == 0) {
				continue
			}
			var message = task.points + " " + task.file.basename
			container.createEl("p", { text: message });
		}
	}

	async recalcTasks() {
		await this.renderTasks()
	}
  
	async onClose() {
	  // Nothing to clean up.
	}
  }
