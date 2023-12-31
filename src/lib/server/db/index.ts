import { DB_PATH } from '$env/static/private';
import Database from 'better-sqlite3';
import * as fs from 'fs';
import { getRollingSevenDayPeriod, getFirstAndLastDateOfCurrentMonth, getFirstAndLastDateOfYear } from '$lib/timeframes';

// if database file doesn't exist, creates it. Else connection is made.
let db: any;

// if Database has not been created, create one. For debug  { verbose: console.log }
export function createDB(){

    if (!fs.existsSync(DB_PATH)){
        db = new Database(DB_PATH,);
        const base_partition = db.prepare("Create TABLE focus (id INTEGER PRIMARY KEY, session datetime default current_timestamp, tag_id TEXT, time_focused INTEGER);");
        const tagsTable = db.prepare("Create TABLE tags (id INTEGER PRIMARY KEY, name TEXT UNIQUE);");
        base_partition.run();
        tagsTable.run();
        addTag("Work");
        addTag("Study");
    } else {
        db = new Database(DB_PATH);
    }
}


// add time studied to database
export function addRecord(session: Date, tag_id: string, time_focused: number){
    const stmt = db.prepare("INSERT INTO focus (session, tag_id, time_focused) VALUES (?, ?, ?)");
    stmt.run(session, tag_id, time_focused);
}


export function getDaily(day: string){

    // const day = new Date().toISOString().split('T')[0]
    const stmt = db.prepare("SELECT session, time_focused, tag_id FROM focus WHERE date(session) = ?");
    let entries = stmt.all(day);

    return entries;
}
  
  
export function getWeekly(currentDay: string){

    const {sevenDaysAgo, today} = getRollingSevenDayPeriod(currentDay);
    const stmt = db.prepare("SELECT session, time_focused, tag_id FROM focus WHERE date(session) >= ? AND date(session) <= ?");
    let entries = stmt.all(sevenDaysAgo, today);

    return entries;
}

  
export function getMonthly(month: string){


    const { firstDate, lastDate } = getFirstAndLastDateOfCurrentMonth(month);
    const stmt = db.prepare("SELECT session, time_focused, tag_id FROM focus WHERE date(session) >= ? AND date(session) < ?");
    let entries = stmt.all(firstDate, lastDate);
    return entries;
}



export function getYearly(year: string){

    const {firstDate, lastDate} = getFirstAndLastDateOfYear(year);
    const stmt = db.prepare("SELECT session, time_focused, tag_id FROM focus WHERE date(session) >= ? AND date(session) < ?");
    let entries = stmt.all(firstDate, lastDate);

    return entries;
}



export function addTag(name: string){
    const stmt = db.prepare("INSERT INTO tags (name) VALUES (?)");
    stmt.run(name);
}


// returns all tags in database
export function getAllTags(){
    const stmt = db.prepare("SELECT name from tags");
    let tags = stmt.all();

    return tags;
}
