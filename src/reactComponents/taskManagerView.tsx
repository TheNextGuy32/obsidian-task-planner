import * as React from "react";
import {Task, TaskManager} from "../taskManager"
import AllTasksView from "./allTasksView"
import ThisWeekView from "./thisWeekView"
import { Vault, App, TFile, EventRef } from "obsidian";
import TaskCreation from "./taskCreation"

interface TaskManagerViewProps {
	app: App
}

interface TaskManagerViewState {
	tasks: Task[]
}

class TaskManagerView extends React.Component<TaskManagerViewProps, TaskManagerViewState> {
	events: EventRef[]
	state:TaskManagerViewState = {
		tasks: []
	}

	updateTasks(tasks: Task[]) {
		this.setState({tasks: tasks})
	}
	
	async reloadTasksIfNewTask(file:TFile, app:App) {
		if(!file.basename.startsWith("05-Tasks")) {
			return
		}
		this.setState({tasks: await TaskManager.getTasks(app.vault)})
	}

	async componentDidMount() {
		this.setState({tasks: await TaskManager.getTasks(this.props.app.vault)})
		this.events.push(this.props.app.vault.on('rename', async (file: TFile) => await this.reloadTasksIfNewTask(file, this.props.app)))
		this.events.push(this.props.app.vault.on('modify', async (file: TFile) => await this.reloadTasksIfNewTask(file, this.props.app)))
		this.events.push(this.props.app.vault.on('create', async (file: TFile) => await this.reloadTasksIfNewTask(file, this.props.app)))
		this.events.push(this.props.app.vault.on('delete', async (file: TFile) => await this.reloadTasksIfNewTask(file, this.props.app)))
		
	}
	async componentWillUnmount(): Promise<void> {
		this.events.forEach((event) => {
			this.props.app.vault.offref(event)
		})
	}

	async reloadTasks(app: App) {
		this.setState({tasks: await TaskManager.getTasks(app.vault)})
	}

	render() {
		var updateTasksCallback = (tasks:Task[]) => {this.updateTasks(tasks)}
		return <div id={"react-root"} key={Math.random()}>
			<h3>Tasks</h3>
			<TaskCreation app={this.props.app} reloadTasksCallback={async (app) => await this.reloadTasks(app)}/>
			<ThisWeekView app={this.props.app} tasks={this.state.tasks} updateTasksCallback={updateTasksCallback}/>
			<AllTasksView app={this.props.app} tasks={this.state.tasks} updateTasksCallback={updateTasksCallback}/>
		</div>;
	}
	
};

export default TaskManagerView

