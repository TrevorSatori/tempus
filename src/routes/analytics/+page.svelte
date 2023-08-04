<script lang="ts">
    // // import type { PageData } from './$types';
    // // export let data: PageData;
    import {getCurrentWeekDates} from '$lib/timeframes';
    
    // basic display data
    let sessions = 0;
    let totalTime = 0;
    let minutes = 0;
    let hours = 0;
    let startTimeFrame: string;
    let endTimeFrame: string;
    let selectedAnalysis: Analysis;
    let res: any;


    // d3 data
    // import d3 from "d3";

    // let hdata = [23,120, 55, 21];

    // function showVis(){
    //     const svgWidth = 600;
    //     const svgHeight = 500;
    //     const origcolor = "#6D3A7E";
    //     const barwidth = 20;
    //     const leftgap = 5;
    //     const innergap = 10;
    //     const unitwidth = barwidth+innergap;
    //     const hist = d3.select("#my_dataviz")
    //                     .append("svg")
    //                         .attr("width", svgWidth)
    //                         .attr("height", svgHeight)
    //                     hist.append("g")
    //                         .attr("fill", origcolor)
    //                         .attr("transform", `translate(${200}, ${200})`)
    //                         .selectAll("rect")
    //                         .data(hdata)
    //                         .join("rect")
    //                         .attr("x", (d,i) => i * unitwidth + leftgap)
    //                         .attr("width", barwidth)
    //                         .attr("y", 0)
    //                         .attr("height", d => d)



    // }
    // END d3 //


    enum Analysis {
        Daily,
        Weekly,
        Monthly,
        Yearly,
    }

    async function getDaily() {
		
        //get results from database
        const response = await fetch('/api/daily');
		res = await response.json();
        
        // assign total sessions to variable, set analysis to daily, 
        // setTotalTime to variable
        sessions = Object.entries(res).length;
        selectedAnalysis = Analysis.Daily;
        setTotalTime();
	}

    async function getWeekly() {
		
        //get results from database
        const response = await fetch('/api/weekly');
		res = await response.json();
        
        // assign total sessions to variable
        sessions = Object.entries(res).length;
        selectedAnalysis = Analysis.Weekly;
        
        // sets total time studied to variable
        setTotalTime();

        const {monday, sunday} = getCurrentWeekDates();
        startTimeFrame = monday.toISOString().split('T')[0];
        endTimeFrame = sunday.toISOString().split('T')[0];
        
	}

    async function getMonthly() {
		
        //get results from database
        const response = await fetch('/api/monthly');
		res = await response.json();
        
        // assign total sessions to variable
        sessions = Object.entries(res).length;
        selectedAnalysis = Analysis.Monthly;
        setTotalTime();

        // Get Monthly format, Format options for month abbreviation and year
        const currentDate = new Date();
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short' };
        const formattedDate = currentDate.toLocaleString('en-US', options);
        endTimeFrame = formattedDate;
	}

    async function getYearly() {
		
        //get results from database
        const response = await fetch('/api/yearly');
		res = await response.json();
        
        // assign total sessions to variable
        sessions = Object.entries(res).length;
        selectedAnalysis = Analysis.Yearly;
        setTotalTime();

        const currentDate = new Date();
        const year = currentDate.getFullYear().toString();
        endTimeFrame = year;
	}


    function setTotalTime(){

        // reset time (ensures time doesn't multiply)
        totalTime = 0;
        // assign total time to variable
        res.forEach((obj: any) => {
        totalTime += obj.time_focused;
        // console.log(obj.time_focused);
        });

        // minutes, hours.
        // if time is less than a minute, will show as 0. 
        minutes = Math.floor(totalTime / 60)
        hours = Math.floor(minutes / 60);

    }

</script>


<div class="join">
    <input class="join-item btn" type="radio" name="options" aria-label="Day" on:click={getDaily} />
    <input class="join-item btn" type="radio" name="options" aria-label="Week" on:click={getWeekly} />
    <input class="join-item btn" type="radio" name="options" aria-label="Month" on:click={getMonthly} />
    <input class="join-item btn" type="radio" name="options" aria-label="Year" on:click={getYearly} />
</div>


{#if selectedAnalysis === Analysis.Daily}
    <h3>{new Date().toISOString().split('T')[0]}</h3>
{:else if selectedAnalysis === Analysis.Weekly}
    <h3>{startTimeFrame} - {endTimeFrame}</h3>
{:else if selectedAnalysis === Analysis.Monthly}
    <h3>{endTimeFrame}</h3>
{:else if selectedAnalysis === Analysis.Yearly}
    <h3>{endTimeFrame}</h3>
{/if}




{#if hours < 1}
    <h3> You've studied a total of {minutes} minutes over {sessions} sessions </h3>
{:else}
    <h3> You've studied a total of {hours} hours {minutes} minutes over {sessions} sessions </h3>
{/if}


