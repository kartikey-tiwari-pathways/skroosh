<script>
    import { auth, db } from "$lib";
    import userImage from "$lib/assets/user.png";
    import { onAuthStateChanged } from "firebase/auth";
    import { doc, getDoc, setDoc } from "firebase/firestore";
    import { setContext } from "svelte";
    let { id } = $props();

    let visible = $state(false);
    let loggedIn = $state(false);
    let postData = $state({
        author_id: 0,
        content: "Loading",
        created_at: Date.now(),
        liker_ids: [1],
        // svelte-ignore state_referenced_locally
        likes: [1].length,
        liked: false,
        title: "Loading"
    });
    let authorUsername = $state("Loading");
    async function getPostData() {
        const ref = doc(db, "posts", id);
        try {
            const snapshot = await getDoc(ref);
            if (!snapshot.exists()) {
                throw new Error("404");
            }
            const likerIds = snapshot.data().liker_ids;
            postData = {...snapshot.data(), likes: likerIds.length, liked: likerIds.includes(auth.currentUser.uid)};
            const userRef = doc(db, "users", postData.author_id.toString());
            const userSnapshot = await getDoc(userRef);
            if (!userSnapshot.exists()) {
                throw new Error("404");
            }
            authorUsername = userSnapshot.data().username;

            visible = true;
        } catch (err) {
            console.error(err);
        }
    }

    async function like(e) {
        e.preventDefault();
        try {
            const ref = doc(db, "posts", id);
            const snapshot = await getDoc(ref);
            const likerIds = snapshot.data().liker_ids;
            if (likerIds.includes(auth.currentUser.uid)) {
                const newLikerIds = likerIds.filter(id => id !== auth.currentUser.uid);
                await setDoc(ref, { liker_ids: newLikerIds }, { merge: true });        
            } else {
                await setDoc(ref, { liker_ids: [...likerIds, auth.currentUser.uid] }, { merge: true });
            }
            getPostData();
        } catch (err) {
            console.error(err);
            alert(err);
        }
    }

    onAuthStateChanged(auth, user => {
        if (user) loggedIn = true;
        getPostData();
    });
</script>
<style>
    a {
        transition: all 100ms;
    }
</style>
{#if visible}
    <a href="/posts/{id}" class="bg-[#E8E8E8] w-1/2 h-fit p-6 rounded-[15px] cursor-pointer hover:bg-[#DCDCDC]">
        <div class="flex">
            <div class="flex items-center gap-2">
                <img src={userImage} alt="user" class="w-10 h-10 rounded-full">
                <span>
                    <p>{authorUsername}</p>
                    <button class="text-blue-500 cursor-pointer underline text-sm">Follow</button>
                </span>
            </div>
            {#if loggedIn}
                {#if postData.liked}
                    <button class="w-6 h-6 min-w-fit min-h-fit ml-auto mr-4 cursor-pointer pointer-events-auto" aria-label="Like post" onclick={like}><svg xmlns="http://www.w3.org/2000/svg"
                        height="48"
                        viewBox="0 -960 960 960"
                        width="48">
                    <path fill="#000080"
                            d="M716-120H272v-512l278-288 39 31q6 5 9 14t3 22v10l-45 211h299q24 0 42 18t18 42v81.84q0 7.16 1.5 14.66T915-461L789-171q-8.88 21.25-29.59 36.12Q738.69-120 716-120ZM79-120v-512h193v60H139v392h133v60H79Z"/>
                    </svg></button>
                {:else}
                    <button class="w-6 h-6 min-w-fit min-h-fit ml-auto mr-4 cursor-pointer pointer-events-auto" aria-label="Like post" onclick={like}><svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#000080"><path d="M716-120H272v-512l278-288 39 31q6 5 9 14t3 22v10l-45 211h299q24 0 42 18t18 42v81.84q0 7.16 1.5 14.66T915-461L789-171q-8.88 21.25-29.59 36.12Q738.69-120 716-120Zm-384-60h397l126-299v-93H482l53-249-203 214v427Zm0-427v427-427Zm-60-25v60H139v392h133v60H79v-512h193Z"/></svg></button>
                {/if}
            {/if}
        </div>
        <p class="text-2xl">{postData.title}</p>
        <p class="text-base">{postData.content}</p>
        <p class="text-[#000080] text-sm">{postData.likes}</p>
    </a>
{/if}