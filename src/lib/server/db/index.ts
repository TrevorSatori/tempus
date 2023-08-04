import { DB_PATH } from '$env/static/private';
import Database from 'better-sqlite3';
import * as fs from 'fs';
import { getCurrentWeekDates, getFirstAndLastDateOfCurrentMonth, getFirstAndLastDateOfYear } from '$lib/timeframes';

// if database file doesn't exist, creates it. Else connection is made.
const db = new Database(DB_PATH, { verbose: console.log });



// if Database has not been created, create one.
// export function createDB(){
//     if (!fs.existsSync(DB_PATH)){
//         const base_partition = db.prepare("Create TABLE focus (id INTEGER PRIMARY KEY, session datetime default current_timestamp, time_focused INTEGER);");
//         base_partition.run();
//         console.log("CREATING DB")
//     }
// }



// add time studied to database
export function addRecord(session: Date, time_focused: number){
    const stmt = db.prepare("INSERT INTO focus (session, time_focused) VALUES (?, ?)");
    stmt.run(session, time_focused);
}


export function getDaily(){
    // get start and end of day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setDate(endOfDay.getDate() + 1);
    endOfDay.setHours(0, 0, 0, 0);

    const stmt = db.prepare("SELECT session, time_focused FROM focus WHERE session >= ? AND session <= ?");
    let entries = stmt.all(startOfDay.toISOString(), endOfDay.toISOString());

    return entries;
}
  
  
export function getWeekly(){

    const {monday, sunday} = getCurrentWeekDates();
    const stmt = db.prepare("SELECT session, time_focused FROM focus WHERE session >= ? AND session <= ?");
    let entries = stmt.all(monday.toISOString(), sunday.toISOString());

    return entries;
}

  
export function getMonthly(){

    const { firstDate, lastDate } = getFirstAndLastDateOfCurrentMonth();
    const stmt = db.prepare("SELECT session, time_focused FROM focus WHERE session >= ? AND session <= ?");
    let entries = stmt.all(firstDate.toISOString(), lastDate.toISOString());
    return entries;
}



export function getYearly(){

    const {firstDate, lastDate} = getFirstAndLastDateOfYear();
    const stmt = db.prepare("SELECT session, time_focused FROM focus WHERE session >= ? AND session <= ?");
    let entries = stmt.all(firstDate.toISOString(), lastDate.toISOString());

    return entries;
}