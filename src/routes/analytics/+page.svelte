<script lang="ts">
    // // import type { PageData } from './$types';
    // // export let data: PageData;
    import {getCurrentWeekDates} from '$lib/timeframes';
    import * as d3 from "d3";
    
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

    function drawData(){
        // Sample data
        const data = [
            { label: 'Category A', value: 30 },
            { label: 'Category B', value: 50 },
            { label: 'Category C', value: 20 },
        ];

        // Set up dimensions
        const width = 400;
        const height = 400;
        const radius = Math.min(width, height) / 2;

        // Create an SVG element
        const svg = d3.select("#chart")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        // Create an arc generator
        const arc = d3.arc<d3.PieArcDatum<{ label: string; value: number }>>() // Use any for innerRadius and outerRadius
            .innerRadius(radius * 0.5)
            .outerRadius(radius * 0.8);

        // Create a pie layout
        const pie = d3.pie<{ label: string; value: number }>()
            .value(d => d.value);

        // Generate pie chart data
        const pieData = pie(data);

        // Create color scale
        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.label))
            .range(d3.schemeCategory10);

        // Draw the donut chart
        svg.selectAll("path")
        .data(pieData)
        .enter().append("path")
        .attr("d", arc)
        .each(function(d) {
            const fillColor: any = color(d.data.label);
            d3.select(this).attr("fill", fillColor);
        })
        .attr("stroke", "white")
        .style("stroke-width", "2px");
    }


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
        drawData();
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


<div class="flex justify-center">
    <svg id="chart"></svg>
</div>

{#if hours < 1}
    <h3> You've studied a total of {minutes} minutes over {sessions} sessions </h3>
{:else}
    <h3> You've studied a total of {hours} hours {minutes} minutes over {sessions} sessions </h3>
{/if}


