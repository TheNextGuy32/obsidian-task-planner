import * as React from 'react';

interface TaskProps {
	vaultName: string, 
	pointsMessage: string, 
	name: string, 
	filepath: string, 
	isDone: boolean,
	moveTaskUpCallback: () => Promise<void>,
	moveTaskDownCallback: () => Promise<void>
}
  
class TaskView extends React.Component<TaskProps> {

	moveTaskUp() {

	}

	moveTaskDown() {
		var s = (name:string) => {}
	}

	render() {
		var className = this.props.isDone ? "doneTask" : ""
		var link = `obsidian://open?vault=${this.props.vaultName}&file=${this.props.filepath}`
		return (
			<p className={className} key={this.props.name}>
				<a href={link}>{this.props.name}</a> {this.props.pointsMessage} 
				
				<span onClick={async ()=>await this.props.moveTaskUpCallback()}> ⬆️</span>
				<span onClick={async ()=>await this.props.moveTaskDownCallback()}>⬇️</span>
			</p>
		);
	}

	
};
  
export default TaskView;
