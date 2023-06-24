import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, Vault } from 'obsidian';
import { days } from "./days"
import { Duration } from 'ts-duration';

export default class CheckinDatabaseFileManager {
	vault: Vault
	checkinDatabaseFile: TFile

	constructor(vault: Vault, checkinDatabaseFile: TFile){
		this.vault = vault
		this.checkinDatabaseFile = checkinDatabaseFile
	}

	async getCheckinEndUtcMillsecondTimestamp(): Promise<Date> {
		const checkinDatabaseFileContents:string = await this.vault.read(this.checkinDatabaseFile)
		var lines = checkinDatabaseFileContents.split("\n")
		var currentDayStart = Number(lines[0])		
		return new Date(currentDayStart + Duration.hour(8).milliseconds)
	}

	async getEndOfCurrentCheckinTime(endOfCheckinDate:Date): Promise<string> {
		var hourOfCheckinEnd = endOfCheckinDate.getHours()
		var isAm = hourOfCheckinEnd < 12
		var endOfCheckinTime = (hourOfCheckinEnd%12) + ":" + endOfCheckinDate.getMinutes() + (isAm ? "AM" : "PM")
		return endOfCheckinTime
	}

	async getCheckins() {
		const checkinDatabaseFileContents:string = await this.vault.read(this.checkinDatabaseFile)
		var lines = checkinDatabaseFileContents.split("\n")
		var checkins:number[] = []
		for(var l in lines) {
			if (lines[l].trim() == "") {
				continue
			}
			var utcTimestampMilliseconds = Number(lines[l].trim())
			checkins.push(utcTimestampMilliseconds)
		}
		checkins.sort((a,b) => a-b)
		return checkins
	}

	async addCheckin(currentTimeStamp:number){
		var checkinDatabaseFileContents:string = await this.vault.read(this.checkinDatabaseFile);
		checkinDatabaseFileContents = currentTimeStamp + "\n" + checkinDatabaseFileContents
		await this.vault.modify(this.checkinDatabaseFile, checkinDatabaseFileContents)
	}

	async calculateDayOfWeekName() {
		var checkinDatabaseFileContents:string = await this.vault.read(this.checkinDatabaseFile);
		var lines = checkinDatabaseFileContents.split("\n").filter((checkin) => checkin.trim() == "")
		console.log(lines)
		return days[lines.length%days.length]
	}
}
