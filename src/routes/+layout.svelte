<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
    import userImage from "$lib/assets/user.png";
    import { auth, db } from '$lib';
    import { collection, doc, documentId, getDoc, getDocs, query, where } from 'firebase/firestore';
    import { onAuthStateChanged, signOut } from 'firebase/auth';
    import { onMount } from 'svelte';

	let { children } = $props();

	let accountStatus = $state(false);
	let username = $state(null);

	onAuthStateChanged(auth, user => {
		accountStatus = !!user;
		if (!accountStatus) return 0;
		getUsername(user);
		getUserCommunities();
	});
	let communities = $state(null);

	async function getUserCommunities(user) {
		if (!accountStatus) {
			communities = null;
			return 0;
		}
		try {
			const userRef = doc(db, "users", user.uid);
			const userSnapshot = await getDoc(userRef);
			const communityList = userSnapshot.data().communities;
			const communitiesQuery = query(collection(db, "communities"), where(documentId(), "in", communityList));
			const communitiesSnapshot = await getDocs(communitiesQuery);
			communitiesSnapshot.forEach(community => {
				communities = [...communities, {id: community.id, ...community.data()}];
			});
		} catch (err) {
			communities = null;
			console.error(err);
		}
	}

	async function getUsername(user) {
		try {
			const userRef = doc(db, "users", user.uid);
			const userSnapshot = await getDoc(userRef);
			username = userSnapshot.data().username || "error";
		} catch (err) {
			console.error(err);
		}
	}
	function logout() {
		signOut(auth);
	}
</script>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap');
	* {
		font-family: "Open Sans", sans-serif;
		font-optical-sizing: auto;
		font-style: normal;
		font-variation-settings:
			"wdth" 100;
		transition: all 100ms;
	}
</style>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<!-- topbar -->
<div class="w-screen h-20 bg-[#262626] flex items-center">
	<!-- Title -->
	<p class="font-extrabold text-4xl text-[#AD3B3B] ml-2">Skroosh</p>

	<!-- Buttons on left -->
	<div class="flex ml-23 gap-5">
		<a href="/"><button class="bg-[#3A3A3A] rounded-[15px] flex items-center justify-center cursor-pointer p-0.5 hover:bg-[#505050]">
			<!-- Home -->
			<svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#ffffff"><path d="M220-180h150v-250h220v250h150v-390L480-765 220-570v390Zm-60 60v-480l320-240 320 240v480H530v-250H430v250H160Zm320-353Z"/></svg>
		</button></a>
		<a href="/explore"><button class="bg-[#3A3A3A] rounded-[15px] flex items-center justify-center cursor-pointer p-0.5 hover:bg-[#505050]">
			<!-- Explore -->
			<svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#ffffff"><path d="m303-303 270-83 83-270-270 83-83 270Zm176.76-137q-16.76 0-28.26-11.74-11.5-11.73-11.5-28.5 0-16.76 11.74-28.26 11.73-11.5 28.5-11.5 16.76 0 28.26 11.74 11.5 11.73 11.5 28.5 0 16.76-11.74 28.26-11.73 11.5-28.5 11.5Zm.51 360q-82.74 0-155.5-31.5Q252-143 197.5-197.5t-86-127.34Q80-397.68 80-480.5t31.5-155.66Q143-709 197.5-763t127.34-85.5Q397.68-880 480.5-880t155.66 31.5Q709-817 763-763t85.5 127Q880-563 880-480.27q0 82.74-31.5 155.5Q817-252 763-197.68q-54 54.31-127 86Q563-80 480.27-80Zm.22-60Q622-140 721-239.49q99-99.48 99-241Q820-622 721-721t-240.51-99q-141.52 0-241 99Q140-622 140-480.49q0 141.52 99.49 241 99.48 99.49 241 99.49ZM480-480Z"/></svg>
		</button></a>
		<a href="/create"><button class="bg-[#3A3A3A] rounded-[15px] flex items-center justify-center cursor-pointer p-0.5 hover:bg-[#505050]">
			<!-- Create -->
			<svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#ffffff"><path d="M180-180h44l472-471-44-44-472 471v44Zm-60 60v-128l575-574q8-8 19-12.5t23-4.5q11 0 22 4.5t20 12.5l44 44q9 9 13 20t4 22q0 11-4.5 22.5T823-694L248-120H120Zm659-617-41-41 41 41Zm-105 64-22-22 44 44-22-22Z"/></svg>
		</button></a>
	</div>

	<!-- Search bar -->
	<div class="relative inline-block">
		<input class="bg-[#474747] w-183 h-14 placeholder:text-[#808080] rounded-[15px] text-white p-2 ml-35" placeholder="What to learn today?" />
		<svg class="absolute right-2 top-1/2 w-8 h-8 pointer-events-none" style="transform: translateY(-50%);" xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#808080"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>
	</div>

	<!-- Login / Signup -->
	<div class="flex items-center justify-center ml-73 gap-5">
		{#if accountStatus}
			<div class="flex items-center gap-2">
				<img src={userImage} alt="user" class="w-10 h-10 rounded-full" />
				<p class="text-white text-base">Hello {username}!</p>
				<button aria-label="Sign out" onclick={logout} class="bg-[#3A3A3A] rounded-[15px] flex items-center justify-center cursor-pointer p-0.5 hover:bg-[#505050]">
					<svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#FFFFFF"><path d="M180-120q-24 0-42-18t-18-42v-600q0-24 18-42t42-18h299v60H180v600h299v60H180Zm486-185-43-43 102-102H360v-60h363L621-612l43-43 176 176-174 174Z"/></svg>
				</button>
			</div>
		{:else if !accountStatus}
			<a href="/auth"><button class="bg-[#3A3A3A] rounded-[15px] flex items-center justify-center cursor-pointer p-0.5 hover:bg-[#505050]">
				<!-- Log in -->
				 <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#FFFFFF"><path d="M481-120v-60h299v-600H481v-60h299q24 0 42 18t18 42v600q0 24-18 42t-42 18H481Zm-55-185-43-43 102-102H120v-60h363L381-612l43-43 176 176-174 174Z"/></svg>
			</button></a>
			<a href="/auth"><button class="bg-[#3A3A3A] rounded-[15px] flex items-center justify-center cursor-pointer p-0.5 hover:bg-[#505050]">
				<!-- Sign up -->
				<svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#FFFFFF"><path d="M730-400v-130H600v-60h130v-130h60v130h130v60H790v130h-60ZM252-523q-42-42-42-108t42-108q42-42 108-42t108 42q42 42 42 108t-42 108q-42 42-108 42t-108-42ZM40-160v-94q0-35 17.5-63.5T108-360q75-33 133.5-46.5T360-420q60 0 118 13.5T611-360q33 15 51 43t18 63v94H40Zm60-60h520v-34q0-16-9-30.5T587-306q-71-33-120-43.5T360-360q-58 0-107.5 10.5T132-306q-15 7-23.5 21.5T100-254v34Zm324.5-346.5Q450-592 450-631t-25.5-64.5Q399-721 360-721t-64.5 25.5Q270-670 270-631t25.5 64.5Q321-541 360-541t64.5-25.5ZM360-631Zm0 411Z"/></svg>
			</button></a>
		{/if}
	</div>
</div>
<!-- sidebar -->
<div class="flex">
	<div class="w-62 h-screen bg-[#262626] flex flex-col gap-2.5">
		{#if communities}
			<p class="font-bold text-xl text-white">Your Communities:</p>
			{#each communities as community}
				<a href="/community/{community.id}" class="w-full flex items-center justify-center"><button class="w-4/5 h-fit p-2 bg-[#3A3A3A] hover:bg-[#505050] text-white cursor-pointer rounded-[15px]">{community.name}</button></a>
			{/each}
		{:else if !accountStatus}
			<p class="font-bold ml-1 text-white">Login to be able to access communities!</p>
		{:else if accountStatus}
			<p class="font-bold ml-1 text-white">You aren't a part of any community. Join one today!</p>
		{/if}
	</div>
	<div class="block w-full">
		{@render children()}
	</div>
</div>