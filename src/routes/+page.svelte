<script lang="ts">
    import { onMount } from "svelte";

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

    onMount(() => {
        getTags();
    });

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

    <div class="navbar bg-base-300 rounded-box">
        <div class="flex-1 px-2 lg:flex-none">
          <a class="text-lg font-bold">Tempus</a>
        </div> 
        <div class="flex justify-end flex-1 px-2">
          <div class="flex items-stretch">
            <a class="btn btn-ghost rounded-btn">Button</a>
            <div class="dropdown dropdown-end">
              <label tabindex="0" class="btn btn-ghost rounded-btn">Tags</label>
              <ul tabindex="0" class="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-52 mt-4">
                <!-- For each loop rendering all tags from database -->
                {#each tags as tag}
                <!-- svelte-ignore a11y-missing-attribute -->
                    <li><a on:click={() => selectedTag = tag.name}>{tag.name}</a></li> 
                {/each}
                <button class="btn btn-primary flex items-center space-x-2" on:click={() => addTag = true}>add tag</button> 
              </ul>
            </div>
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
    
    <div class="grid place-items-center bg-clip-padding">
        <img 
            src="borat.png" 
            width="400" 
            height="400" 
            alt="failed to load"
            class="mb-4"
        />

        <div>
            {selectedTag}
        </div>

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
