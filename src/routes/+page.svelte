<script lang="ts">

    import type { PageData } from './$types';
    import {onMount} from "svelte";

    let isFocused = false;
    let intervalId: number | null = null;
    let totalTime = 0;
    let date: Date | null = null;

    $: hours = 0;
    $: minutes = 0;
    $: seconds = 0;



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
				totalTime
			})
		})
	}

</script>

<body>
    <div class="grid place-items-center bg-clip-padding">
        <img 
            src="borat.png" 
            width="400" 
            height="400" 
            alt="failed to load"
            class="mb-4"
        />
        {#if !isFocused}
            <button class="btn btn-success btn-lg mt-4 mb-2" on:click={startFocus}>Focus</button> <!-- Decreased the bottom margin -->
        {:else}
            <button type="submit" class="btn btn-error mt-8 mb-2" on:click={stopFocus}>Stop</button> <!-- Decreased the bottom margin -->
        {/if}
    </div>
    <span class="countdown font-mono text-2xl mt-4 mb-2"> <!-- Adjusted margins here too -->
        <span style="--value:{hours};"></span>:
        <span style="--value:{minutes};"></span>:
        <span style="--value:{seconds};"></span>
    </span>
    {#if totalTime < 60 && isFocused}
        <h3 class="mt-2">(Sessions less than a minute won't be recorded)</h3> <!-- Adjusted margin top -->
    {/if}
</body>
