export function getRollingSevenDayPeriod() {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 5);
    today.setHours(23, 59, 59, 999);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
  
    return {sevenDaysAgo, today};
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