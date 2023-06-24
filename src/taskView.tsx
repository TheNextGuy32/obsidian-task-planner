import { Notice, TFile, getLinkpath, MarkdownRenderer, ItemView, WorkspaceLeaf, Vault, App } from 'obsidian';
import { TaskManager, Task } from './taskManager';
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Root, createRoot } from "react-dom/client";
import TaskManagerView from "./reactComponents/taskManagerView"


export default class TaskView extends ItemView {
    static taskViewType = "task-view"
	root: Root | undefined
	
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
		this.renderTasks(this.app)
	}

	async renderTasks(app: App) {
		var container = this.containerEl.children[1]
		if (this.root == undefined) {
			this.root = createRoot(container) 		
		}
		this.root.render(
			<React.StrictMode>
				<TaskManagerView app={app}/>
			</React.StrictMode>
		);
	}

	async recalcTasks(app: App) {
		await this.renderTasks(app)
	}
  
	async onClose() {
		// ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
	}
  }
