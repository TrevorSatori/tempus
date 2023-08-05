import { DB_PATH } from '$env/static/private';
import Database from 'better-sqlite3';
import * as fs from 'fs';
import { getCurrentWeekDates, getFirstAndLastDateOfCurrentMonth, getFirstAndLastDateOfYear } from '$lib/timeframes';

// if database file doesn't exist, creates it. Else connection is made.
let db: any;

// if Database has not been created, create one.
export function createDB(){

    if (!fs.existsSync(DB_PATH)){
        db = new Database(DB_PATH, { verbose: console.log });
        const base_partition = db.prepare("Create TABLE focus (id INTEGER PRIMARY KEY, session datetime default current_timestamp, tag_id TEXT, time_focused INTEGER);");
        const tagsTable = db.prepare("Create TABLE tags (id INTEGER PRIMARY KEY, name TEXT UNIQUE);");
        base_partition.run();
        tagsTable.run();
        addTag("Work");
        addTag("Study");
    } else {
        db = new Database(DB_PATH, { verbose: console.log });
    }
}


// add time studied to database
export function addRecord(session: Date, tag_id: string, time_focused: number){
    const stmt = db.prepare("INSERT INTO focus (session, tag_id, time_focused) VALUES (?, ?, ?)");
    stmt.run(session, tag_id, time_focused);
}


export function getDaily(){
    // get start and end of day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setDate(endOfDay.getDate() + 1);
    endOfDay.setHours(0, 0, 0, 0);

    const stmt = db.prepare("SELECT session, time_focused, tag_id FROM focus WHERE session >= ? AND session <= ?");
    let entries = stmt.all(startOfDay.toISOString(), endOfDay.toISOString());

    return entries;
}
  
  
export function getWeekly(){

    const {monday, sunday} = getCurrentWeekDates();
    const stmt = db.prepare("SELECT session, time_focused, tag_id FROM focus WHERE session >= ? AND session <= ?");
    let entries = stmt.all(monday.toISOString(), sunday.toISOString());

    return entries;
}

  
export function getMonthly(){

    const { firstDate, lastDate } = getFirstAndLastDateOfCurrentMonth();
    const stmt = db.prepare("SELECT session, time_focused, tag_id FROM focus WHERE session >= ? AND session <= ?");
    let entries = stmt.all(firstDate.toISOString(), lastDate.toISOString());
    return entries;
}



export function getYearly(){

    const {firstDate, lastDate} = getFirstAndLastDateOfYear();
    const stmt = db.prepare("SELECT session, time_focused, tag_id FROM focus WHERE session >= ? AND session <= ?");
    let entries = stmt.all(firstDate.toISOString(), lastDate.toISOString());

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
