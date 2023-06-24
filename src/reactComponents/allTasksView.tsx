import * as React from "react";
import {Task} from "../taskManager"
import TaskView from "./taskView"
import { App } from "obsidian";
import {TaskManager} from "../taskManager"
interface AllTasksProps {
	app:App, 
	tasks: Task[],
	updateTasksCallback: (tasks: Task[]) => void
}

const swapElements = (array: any[], index1:number, index2:number) => {
    [array[index1], array[index2]] = [array[index2], array[index1]];
};

class AllTasksView extends React.Component<AllTasksProps> {
	async assignNewTaskOrders(app: App, tasks: Task[]) : Promise<void> {
		var index = 0
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
		tasks.sort((a,b) => a.order-b.order)
		this.props.updateTasksCallback(tasks)
	}

	async moveTaskUp(app: App, tasks:Task[], t:number) {
		if (t==0) {
			return
		}
		swapElements(tasks, t, t-1);
		await this.assignNewTaskOrders(app, tasks)
	}

	async moveTaskDown(app: App, tasks:Task[], t:number) {
		if (t==tasks.length-1) {
			return
		}
		swapElements(tasks, t, t+1);
		await this.assignNewTaskOrders(app, tasks)
	}

	render() {
		var taskViews: React.ReactNode[] = []
		this.props.tasks.forEach((task, index)=> {

			var remainingPoints = task.points - task.workedOnUtcTimestamps.length
			// if (remainingPoints == 0) {
			// 	return
			// }

			taskViews.push(<TaskView 
				key={task.file.name}
				vaultName={this.props.app.vault.getName()} 
				isDone={remainingPoints == 0}
				pointsMessage={`${remainingPoints.toString()}pts`} 
				name={task.file.basename} 
				filepath={task.file.basename}
				moveTaskUpCallback={async ()=>{ await this.moveTaskUp(this.props.app, this.props.tasks, index) }}
				moveTaskDownCallback={async ()=>{ await this.moveTaskDown(this.props.app, this.props.tasks, index) }}
			/>)
		})

		return <div>
			<h4>Tasks</h4>
			<div>
				{taskViews}
			</div>
		</div>;
	}
};
export default AllTasksView;
