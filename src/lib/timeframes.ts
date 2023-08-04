
export function getCurrentWeekDates(): { monday: Date; sunday: Date } {
    const currentDate = new Date();
    const currentDayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
  
    // Calculate days to Monday (1) and Sunday (7)
    const daysToMonday = 1 - currentDayOfWeek;
    const daysToSunday = 7 - currentDayOfWeek;
  
    // Create the Monday and Sunday dates
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + daysToMonday);
    monday.setHours(0, 0, 0, 0);
  
    const sunday = new Date(currentDate);
    sunday.setDate(currentDate.getDate() + daysToSunday + 1);
    sunday.setHours(0, 0, 0, 0);
    return { monday, sunday };
}

export function getFirstAndLastDateOfCurrentMonth(): { firstDate: Date; lastDate: Date } {
    
    // get first day of month
    const today = new Date();
    const firstDate = new Date(today.getFullYear(), today.getMonth(), 1);
    firstDate.setHours(0, 0, 0, 0);
    
    // get last day of month
    const lastDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    lastDate.setHours(0, 0, 0, 0);
    return { firstDate, lastDate };
}

export function getFirstAndLastDateOfYear(): { firstDate: Date; lastDate: Date } {
    const firstDate = new Date();
    firstDate.setMonth(0); 
    firstDate.setDate(1);
    firstDate.setHours(0, 0, 0, 0);

    const lastDate = new Date();
    lastDate.setFullYear(lastDate.getFullYear() + 1); // Move to the next year
    lastDate.setMonth(0);
    lastDate.setDate(1); 
    lastDate.setHours(0, 0, 0, 0)
    return {firstDate, lastDate};
}