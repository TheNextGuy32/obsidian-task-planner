import * as React from "react";
import {Task} from "../taskManager"
import TaskView from "./taskView"
import { App, Vault } from "obsidian";

interface ThisWeekViewProps {
	app:App, 
	tasks: Task[],
	updateTasksCallback: (tasks: Task[]) => void
}

class ThisWeekView extends React.Component<ThisWeekViewProps> {
	render() {
		var weekPointTotal = 5

	var thisWeeksTasks: React.ReactNode[] = []
	for(var task of this.props.tasks) {
		var remainingPoints = task.points - task.workedOnUtcTimestamps.length
		if (remainingPoints == 0) {
			continue
		}

		var pointsLeftOverAfterTask = weekPointTotal - remainingPoints
		var thisPointTotal = pointsLeftOverAfterTask < 0 ? `${remainingPoints + pointsLeftOverAfterTask} of ${remainingPoints}pts`  : `${remainingPoints}pts`
		weekPointTotal -= remainingPoints

		thisWeeksTasks.push(<TaskView 
			key={task.file.name}
			isDone={false}
			vaultName={this.props.app.vault.getName()} 
			pointsMessage={thisPointTotal} 
			name={task.file.basename} 
			filepath={task.file.basename}
			moveTaskDownCallback={async ()=>{}}
			moveTaskUpCallback={async ()=>{}}
		/>)
		if (weekPointTotal <= 0) {
			break;
		}		
	}

	return <div>
		<h4>Next 5 Days</h4>
		<div>
			{thisWeeksTasks}
		</div>
	</div>;
	}
};
export default ThisWeekView
