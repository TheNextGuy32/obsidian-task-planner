import * as React from "react";
import {Task} from "../taskManager"
import TaskView from "./taskView"
import { Notice, Vault, App } from "obsidian";
import {TaskManager} from "../taskManager"

interface TaskCreationProps {
	app: App
	createFileCallback: (path:string, contents:string) => Promise<void> 
}

type TaskCreationState = {
	chosenPointsValue:number,
	taskNameValue: string
}

class TaskCreation extends React.Component<TaskCreationProps, TaskCreationState> {
	state:TaskCreationState = {
		chosenPointsValue: 1,
		taskNameValue: ""
	}
	async createTask(app: App) {
		if(this.state.taskNameValue == "") {
			new Notice("Task name cannot be blank.")
			return
		}
		var path = `05-Tasks/${this.state.taskNameValue}.md`
		var contents = `Points: ${this.state.chosenPointsValue}\nOrder: 0\nWorkedOn: \n`
		await app.vault.create(path, contents)
		// await this.props.createFileCallback(path, contents)

		this.setState({
			taskNameValue: ""
		})
	}
	updateInputValue(evt: React.ChangeEvent<HTMLInputElement>) {
		const val = evt.target.value; 
		this.setState({
			taskNameValue: val
		})
	}
	render() {
		var pointOptions = [1,2,3,4,5]
		return <div>
			<input className={"taskNameInput"} value={this.state.taskNameValue} onChange={evt => this.updateInputValue(evt)}/>
			{pointOptions.map((points) => <button key={points} className={points == this.state.chosenPointsValue ? "activePointsButton" : "pointsButton"} onClick={()=> this.setState({chosenPointsValue: points})}>{points}</button>)}
			<button className={"taskButton"} onClick={async ()=> await this.createTask(this.props.app)}>📝</button>
		</div>;
	}
};
export default TaskCreation;
