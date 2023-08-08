export function getRollingSevenDayPeriod(currentDay: string){
    const today = new Date(currentDay);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    return {
        sevenDaysAgo: sevenDaysAgo.toISOString().split('T')[0],
        today: today.toISOString().split('T')[0], 
    };
}

export function getFirstAndLastDateOfCurrentMonth(month: string): { firstDate: string; lastDate: string } {
    
    // get first day of month
    const today = new Date(month);
    const firstDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    
    // get last day of month
    const lastDate = new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString().split('T')[0];
    return { firstDate, lastDate };

}

export function getFirstAndLastDateOfYear(year: string): { firstDate: string; lastDate: string } {
    const firstDate = new Date(year);
    firstDate.setMonth(0); // January
    firstDate.setDate(0); // First day of the year

    const lastDate = new Date(year);
    lastDate.setFullYear(lastDate.getFullYear()); // Current year
    lastDate.setMonth(11); // December
    lastDate.setDate(31); // Last day of the year

    return {
        firstDate: firstDate.toISOString().split('T')[0],
        lastDate: lastDate.toISOString().split('T')[0],
    };
}
