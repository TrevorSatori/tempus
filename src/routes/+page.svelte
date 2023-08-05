<script lang="ts">
    import { onMount } from "svelte";
    import {getCurrentWeekDates} from '$lib/timeframes';
    import * as d3 from "d3";


    let isFocused = false;
    let intervalId: number | null = null;
    let totalTime = 0;
    let date: Date | null = null;
    let addTag = false;
    let newTag = "";
    let selectedTag = "Work";
    let tags: Array<any> = [];

    $: hours = 0;
    $: minutes = 0;
    $: seconds = 0;
    

    // Analytics merge 
    // basic display data
    let sessions = 0;
    let totalTimeAnalytics = 0;
    let minutesAnalytics = 0;
    let hoursAnalytics = 0;
    let startTimeFrame: string;
    let endTimeFrame: string;
    let selectedAnalysis: Analysis;
    let res: any;
    
    enum Analysis {
        Daily,
        Weekly,
        Monthly,
        Yearly,
    }

    // d3 data

    function drawData(){

        // get percenta
        // const data = calculatePercentage();

        const percentageMap = calculatePercentage();
        console.log(calculatePercentage())

        const data = Array.from(percentageMap.entries()).map(([label, value]) => ({
            label: label,
            value: value
        }));

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

    async function getDaily() {
		
        //get results from database
        const response = await fetch('/api/daily');
		res = await response.json();
        
        // assign total sessions to variable, set analysis to daily, 
        // setTotalTime to variable
        sessions = Object.entries(res).length;
        selectedAnalysis = Analysis.Daily;
        setTotalTime();
        calculateTagDistribution();
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

    // Calculate total time studied
    function setTotalTime(){

        // reset time (ensures time doesn't multiply)
        totalTimeAnalytics = 0;
        // assign total time to variable
        res.forEach((obj: any) => {
            totalTimeAnalytics += obj.time_focused;
        });

        // minutes, hours.
        // if time is less than a minute, will show as 0. 
        minutesAnalytics = Math.floor(totalTimeAnalytics / 60)
        hoursAnalytics = Math.floor(minutesAnalytics / 60);

    }

    ///


    onMount(() => {
        getTags();
    });

    // timeDistribution();

    // calculate tag distribution (Takes in enum)
    function calculateTagDistribution(){

        const tagTimeMap = new Map();

        // Iterate through the array and update the map
        res.forEach((item: { time_focused: any; tag_id: any; }) => {
            const { time_focused, tag_id } = item;
            if (tagTimeMap.has(tag_id)) {
                tagTimeMap.set(tag_id, tagTimeMap.get(tag_id) + time_focused);
            } else {
                tagTimeMap.set(tag_id, time_focused);
            }
        });

        return tagTimeMap;

    
    }

    function calculatePercentage() {

        const tagTimeMap = calculateTagDistribution();
        const totalSum = Array.from(tagTimeMap.values()).reduce((sum, value) => sum + value, 0);
        const percentageMap = new Map();

        tagTimeMap.forEach((time_focused, tag_id) => {
            const percentage = Math.round((time_focused / totalSum) * 100);
            percentageMap.set(tag_id, percentage);
        });
        return percentageMap;
    }



    async function getTags(){
        const res = await fetch(`/api/tags`);
        const data = await res.json();
        tags = data;
    }

    function organizeTime(){

        seconds += 1;
        totalTime += 1;
        // extra second is compensated for by setting seconds to 1
        // allows animation to render correctly
        if (seconds === 61) {
            seconds = 1;
            minutes += 1;
        }

        // if focused for an hour, reset minutes, reset hours 
        if (minutes === 60){
            hours += 1;
            minutes = 0;
            seconds = 0;
        }
    }

    // start focus, increase time, get time snapshot.
    function startFocus(){
        
        isFocused = true
        date = new Date();
        totalTime = 0;
        intervalId = window.setInterval(organizeTime, 1000);
        organizeTime();
        // --- TODO Create Wowoweewah noise --- |||
    }

    function stopFocus(){
        isFocused = false;
        if (intervalId !== null){
            clearInterval(intervalId);
        }
        seconds = 0;
        minutes = 0;
        hours = 0;

        // if session less than a minute, don't add to records
        if (totalTime >= 60){
            // post
            postData();
        }
       
    }

	async function postData () {
		const res = await fetch('/api/update', {
			method: 'POST',
			body: JSON.stringify({
				date,
                selectedTag,
				totalTime,
			})
		})
	}

    function isValidInput(){
        const regex = /^[A-Za-z ]{2,21}$/;
        return regex.test(newTag);
    }

    // add tag to database
    async function createTag(){
        const res = await fetch('/api/tags', {
			method: 'POST',
			body: JSON.stringify({
				newTag
			})
		})

        addTag = false;
        newTag = "";

        // refresh tag list
        getTags();
    }

</script>

<body>

    <!-- Navbar -->
    <div class="navbar bg-base-300 rounded-box">
        <div class="flex-1 px-2 lg:flex-none">
          <!-- svelte-ignore a11y-missing-attribute -->
          <a class="text-lg font-bold">Tempus</a>
        </div> 
        <div class="flex justify-center flex-1 px-2">
            <div class="join">
                <input class="join-item btn btn-ghost rounded-btn" type="radio" name="options" aria-label="Day" on:click={getDaily} />
                <input class="join-item btn btn-ghost rounded-btn" type="radio" name="options" aria-label="Week" on:click={getWeekly} />
                <input class="join-item btn btn-ghost rounded-btn" type="radio" name="options" aria-label="Month" on:click={getMonthly} />
                <input class="join-item btn btn-ghost rounded-btn" type="radio" name="options" aria-label="Year" on:click={getYearly} />
            </div>
          
        </div>
        <div class="flex justify-end">
            <!-- svelte-ignore a11y-missing-attribute -->
            <div class="dropdown dropdown-end">
                <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label tabindex="0" class="btn btn-ghost rounded-btn m-1">Tags</label>
                <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                <ul tabindex="0" class="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-52 mt-4">
                <!-- For each loop rendering all tags from database -->
                {#each tags as tag}
                <!-- svelte-ignore a11y-missing-attribute -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <li><a on:click={() => selectedTag = tag.name}>{tag.name}</a></li> 
                {/each}
                <button class="btn btn-primary flex items-center space-x-2" on:click={() => addTag = true}>add tag</button> 
                </ul>
            </div>
        </div>
    </div>


    <!-- Render addTag if button pressed -->
    {#if (addTag == true)}
        <div class="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-gray-900">
            <div class="bg-black p-4 rounded shadow-lg">
                <input type="text" class="input input-bordered mb-2" placeholder="Tag Name" bind:value={newTag}>
                {#if !(newTag.length === 0) && (isValidInput())}
                    <button class="btn btn-primary" on:click={createTag}>Add</button>
                {:else}
                    <p>Only Letters and spaces can be used for a tag.</p>
                {/if}
            </div>
        </div>
    {/if}


    <!-- borat, button, timer, tag  -->
    <div class="container mx-auto">
        <div class="grid place-items-center p-10">
            <img 
            src="borat.png" 
            width="500" 
            height="500" 
            alt="failed to load"
            />
        </div>
        <div class="grid grid-rows-2">
            <div class="badge badge-secondary badge-outline mx-auto p-4">{selectedTag}</div>
            <div>
                <span class="countdown font-mono text-2xl mt-4 mb-2"> <!-- Adjusted margins here too -->
                    <span style="--value:{hours};"></span>:
                    <span style="--value:{minutes};"></span>:
                    <span style="--value:{seconds};"></span>
                </span>
                {#if totalTime < 60 && isFocused}
                    <h3 class="mt-2">(Sessions less than a minute won't be recorded)</h3> <!-- Adjusted margin top -->
                {/if}
            </div>
            {#if !isFocused}
                <button class="btn btn-success btn-lg mt-4 mb-2" on:click={startFocus}>Focus</button> <!-- Decreased the bottom margin -->
            {:else}
                <button class="btn btn-error btn-lg mt-4 mb-2 " on:click={stopFocus}>Stop</button> <!-- Decreased the bottom margin -->
            {/if}
        </div>
    </div>

    <!-- Begin analytics -->
    
    <div class="grid grid-cols-1">
        <div class="bg-gray-200 bg-opacity-0 p-4"></div>
        <div class="bg-gray-200 bg-opacity-0 p-4"></div>
        <div class="bg-gray-200 bg-opacity-0 p-4"></div>
        <!-- Timeline -->
        <div>
            {#if selectedAnalysis === Analysis.Daily}
                <h3>{new Date().toISOString().split('T')[0]}</h3>
            {:else if selectedAnalysis === Analysis.Weekly}
                <h3>{startTimeFrame} - {endTimeFrame}</h3>
            {:else if selectedAnalysis === Analysis.Monthly}
                <h3>{endTimeFrame}</h3>
            {:else if selectedAnalysis === Analysis.Yearly}
                <h3>{endTimeFrame}</h3>
            {/if}
        </div>
    </div>


    {#if !isFocused}
        <!-- Data visualizations -->
        <div class="grid grid-cols-1 mx-auto">
            <div class="mx-auto">
                <svg id="chart"></svg>
            </div>
            <div class="bg-purple-200"></div>
            
        </div>

        <div class="grid grid-cols-1">
            <div class="bg-gray-200 bg-opacity-0 p-4"></div>
            <div class="bg-gray-200 bg-opacity-0 p-4"></div>
            {#if hoursAnalytics < 1 && (selectedAnalysis !== undefined)}
                <h3> You've studied a total of {minutesAnalytics} minutes over {sessions} sessions </h3>
            {:else if (selectedAnalysis !== undefined)}
                <h3> You've studied a total of {hoursAnalytics} hours {minutesAnalytics} minutes over {sessions} sessions </h3>
            {/if}
        </div>
    {/if}

</body>

