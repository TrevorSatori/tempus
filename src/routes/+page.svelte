<script lang="ts">

    import { onMount } from "svelte";
    import {getRollingSevenDayPeriod} from '$lib/timeframes';
    import * as d3 from "d3";
    import TagDistribution from "$lib/components/TagDistribution.svelte";
    import ThemeSelector from "$lib/components/ThemeSelector.svelte";
    import { themeChange } from 'theme-change';
    
    let isFocused = false;
    let intervalId: number | null = null;
    let totalTime = 0;
    let date: Date | null = null;
    let addTag = false;
    let newTag = "";
    let selectedTag = "Work";
    let tags: Array<any> = [];

    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    

    // Analytics merge 
    enum Analysis {
        Daily,
        Weekly,
        Monthly,
        Yearly,
    }
    // basic display data
    let sessions = 0;
    let totalTimeAnalytics = 0;
    let minutesAnalytics = 0;
    let hoursAnalytics = 0;
    let startTimeFrame: string;
    let endTimeFrame: string;
    let selectedAnalysis: Analysis;
    let res: any;
    let tagData: any = [];

    let wannaSee = false;

    // d3 data
    onMount(() => {
        themeChange(false);
        getTags();
        fetchData(Analysis.Daily);
    });

    function drawData(){

        const percentageMap = calculatePercentage();
        
        const data = Array.from(percentageMap.entries()).map(([label, value]) => ({
            label: label,
            value: value.percentage,
            time_focused: value.time_focused 
        }));


        data.sort((a, b) => b.value - a.value);
        tagData = data;

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


    // fetch data from database, set selectedAnalysis
    async function fetchData(analysis: Analysis){

        let analysisString: string = Analysis[analysis].toLocaleLowerCase();
        const response = await fetch(`/api/${analysisString}`);
		res = await response.json();

        // assign total sessions to variable, set analysis to daily, 
        // setTotalTime to variable
        selectedAnalysis = analysis;
        sessions = Object.entries(res).length;
        renderDates(analysis);
        setTotalTime();
        drawData();
    }

    function renderDates(analysis: Analysis){
        if (analysis === Analysis.Weekly){
            const {sevenDaysAgo, today} = getRollingSevenDayPeriod();
            startTimeFrame = sevenDaysAgo.toISOString().split('T')[0];
            endTimeFrame = today.toISOString().split('T')[0];
        } else if(analysis === Analysis.Monthly){
            // Get Monthly format, Format options for month abbreviation and year
            const currentDate = new Date();
            const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short' };
            const formattedDate = currentDate.toLocaleString('en-US', options);
            endTimeFrame = formattedDate;
        } else if (analysis === Analysis.Yearly){
            const currentDate = new Date();
            const year = currentDate.getFullYear().toString();
            endTimeFrame = year;
        }
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
            // percentageMap.set(tag_id, percentage);
            const entry = {
                tag_id: tag_id,
                percentage: percentage,
                time_focused: time_focused
            };
            percentageMap.set(tag_id, entry);
            
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
        if (totalTime >= (60 * 5)){
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
        const regex = /^[A-Za-zsetTotalTime(); ]{2,21}$/;
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

<body class="min-h-screen">

    <!-- Navbar -->
    <div class="navbar bg-base-300 rounded-box">
        <div class="flex-1 px-2 lg:flex-none">
          <!-- svelte-ignore a11y-missing-attribute -->
          <a class="text-lg font-bold">Tempus</a>
        </div> 
        <div class="flex justify-center flex-1 px-2">
            <div class="join">
                <button class="join-item btn btn-ghost rounded-btn" on:click={() => {fetchData(Analysis.Daily); wannaSee = true;}}>Day</button>
                <button class="join-item btn btn-ghost rounded-btn" on:click={() => {fetchData(Analysis.Weekly); wannaSee = true;}}>Week</button>
                <button class="join-item btn btn-ghost rounded-btn" on:click={() => {fetchData(Analysis.Monthly); wannaSee = true;}}>Month</button>
                <button class="join-item btn btn-ghost rounded-btn" on:click={() => {fetchData(Analysis.Yearly); wannaSee = true;}}>Year</button>
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

    <div id="visualization"></div>

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
                {#if totalTime < (60 * 5) && isFocused}
                    <h3 class="mt-2">(Sessions less than five minutes won't be recorded)</h3> <!-- Adjusted margin top -->
                {/if}
            </div>
            {#if !isFocused}
                <button class="btn btn-success btn-lg mt-4 mb-2" on:click={startFocus}>Focus</button> <!-- Decreased the bottom margin -->
            {:else}
                <button class="btn btn-error btn-lg mt-4 mb-2 " on:click={() => {stopFocus(); wannaSee = false;}}>Stop</button> <!-- Decreased the bottom margin -->
            {/if}
        </div>
    </div>

   
    
    <!-- Begin analytics -->
    {#if !isFocused && wannaSee}
        <div class="grid grid-cols-1">
            <div class="bg-gray-200 bg-opacity-0 p-4"></div>
            <div class="bg-gray-200 bg-opacity-0 p-4"></div>
            <div class="bg-gray-200 bg-opacity-0 p-4"></div>
            <!-- Timeline -->
            <div> 
                {#if selectedAnalysis === Analysis.Daily}
                    <h2 class="text-primary text-lg font-mono">{new Date().toISOString().split('T')[0]}</h2>
                {:else if selectedAnalysis === Analysis.Weekly}
                    <h2 class="text-primary text-lg font-mono">{startTimeFrame} - {endTimeFrame}</h2>
                {:else if selectedAnalysis === Analysis.Monthly}
                    <h2 class="text-primary text-lg font-mono">{endTimeFrame}</h2>
                {:else if selectedAnalysis === Analysis.Yearly}
                    <h2 class="text-primary text-lg font-mono">{endTimeFrame}</h2>
                {/if}
                <TagDistribution tagData={tagData} />
            </div>
        </div>

        <!-- Data visualizations -->
        <div class="grid grid-cols-1">
            <div class="bg-gray-200 bg-opacity-0 p-4"></div>
            <div class="bg-gray-200 bg-opacity-0 p-4"></div>
            {#if hoursAnalytics < 1}
                <h3> You've studied a total of {minutesAnalytics} minutes over {sessions} sessions </h3>
            {:else}
                <h3> You've studied a total of {hoursAnalytics} hours {minutesAnalytics} minutes over {sessions} sessions </h3>
            {/if}
        </div>
    {/if}

    

</body>
<footer>
    <footer class="footer items-center p-4 bg-neutral text-neutral-content">
        <div class="items-center grid-flow-col">
            <!-- https://github.com/TrevorSatori/tempus -->
          <svg width="36" height="36" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" class="fill-current"><path d="M22.672 15.226l-2.432.811.841 2.515c.33 1.019-.209 2.127-1.23 2.456-1.15.325-2.148-.321-2.463-1.226l-.84-2.518-5.013 1.677.84 2.517c.391 1.203-.434 2.542-1.831 2.542-.88 0-1.601-.564-1.86-1.314l-.842-2.516-2.431.809c-1.135.328-2.145-.317-2.463-1.229-.329-1.018.211-2.127 1.231-2.456l2.432-.809-1.621-4.823-2.432.808c-1.355.384-2.558-.59-2.558-1.839 0-.817.509-1.582 1.327-1.846l2.433-.809-.842-2.515c-.33-1.02.211-2.129 1.232-2.458 1.02-.329 2.13.209 2.461 1.229l.842 2.515 5.011-1.677-.839-2.517c-.403-1.238.484-2.553 1.843-2.553.819 0 1.585.509 1.85 1.326l.841 2.517 2.431-.81c1.02-.33 2.131.211 2.461 1.229.332 1.018-.21 2.126-1.23 2.456l-2.433.809 1.622 4.823 2.433-.809c1.242-.401 2.557.484 2.557 1.838 0 .819-.51 1.583-1.328 1.847m-8.992-6.428l-5.01 1.675 1.619 4.828 5.011-1.674-1.62-4.829z"></path></svg> 
          <p>Created by Trevor Satori. If you enjoy make sure to leave a star on <a class="text-primary" href="https://github.com/TrevorSatori/tempus">Github.</a></p>
        </div>
        <ThemeSelector /> 
        <div class="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
          <a href="https://youtube.com/@satoridigital1078"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="fill-current"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg></a>
        </div>
      </footer>
</footer>
