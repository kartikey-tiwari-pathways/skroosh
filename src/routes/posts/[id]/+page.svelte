<script>
    import { getContext, onMount } from 'svelte';
    import { auth, db } from '$lib';
    import { collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
    import userImage from "$lib/assets/user.png";
    import { onAuthStateChanged } from 'firebase/auth';
    let { params } = $props();
    let postId = $derived(params.id);
    let loggedIn = $state(false);
    let visible = $state(false);
    let authorUsername = $state("");
    let postData = $state({
        author_id: 0,
        content: "Loading",
        created_at: serverTimestamp(),
        liker_ids: [1],
        title: "Loading"
    });
    let comments = $state([]);
    async function getPostData() {
        const ref = doc(db, "posts", postId);
        try {
            const snapshot = await getDoc(ref);
            if (!snapshot.exists()) {
                throw new Error("404");
            }
            postData = snapshot.data();
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
    
    async function getComments() {
        try {
            comments = [];
            const commentsCollection = collection(db, "posts", postId, "comments");
            const commentsSnapshot = await getDocs(query(collection(db, "posts", postId, "comments"), orderBy("created_at", "asc")));
            commentsSnapshot.forEach(async comment => {
                const userRef = doc(db, "users", comment.data().author_id);
                const userSnapshot = await getDoc(userRef);
                let liked = false;
                if (loggedIn) {
                    if (comment.data().liker_ids.includes(auth.currentUser.uid)) liked = true
                }
                comments = [...comments, {id: comment.id, likes: comment.data().liker_ids.length, author_username: userSnapshot.data().username, liked: liked, ...comment.data()}];
            });
        } catch (err) {
            console.error(err);
            alert(err);
        }
    }
    async function like(comment_id) {
        try {
            const commentRef = doc(db, "posts", postId, "comments", comment_id);
            const commentSnapshot = await getDoc(commentRef);
            const likerIds = commentSnapshot.data().liker_ids;
            if (likerIds.includes(auth.currentUser.uid)) {
                const newLikerIds = likerIds.filter(id => id !== auth.currentUser.uid);
                await setDoc(commentRef, { liker_ids: newLikerIds }, { merge: true });        
            } else {
                await setDoc(commentRef, { liker_ids: [...likerIds, auth.currentUser.uid] }, { merge: true });
            }
            getComments();
        } catch (err) {
            console.error(err);
            alert(err);
        }
    }
    onAuthStateChanged(auth, user => {
        if (user) loggedIn = true;
        getPostData();
        getComments();
    })
</script>

<p class="text-4xl text-black">{postData.title}</p>
<p class="text-sm">{new Date(postData.created_at.seconds * 1000).toDateString()}</p>
<div class="flex items-center gap-2">
    <img src={userImage} alt="user" class="w-10 h-10 rounded-full">
    <span>
        <p>{authorUsername}</p>
        <button class="text-blue-500 cursor-pointer underline text-sm">Follow</button>
    </span>
</div>
<hr />
<p>{postData.content}</p>
<hr />
<p class="text-2xl text-black">Comments</p>
<div class="flex flex-col gap-5 items-center">
    {#each comments as comment}
        <div class="rounded-[15px] bg-[#E8E8E8] w-11/12 h-fit p-5 mx-2">
        <div class="flex">
            <div class="flex items-center gap-2">
                <img src={userImage} alt="user" class="w-10 h-10 rounded-full">
                <span>
                    <p>{comment.author_username}</p>
                    <button class="text-blue-500 cursor-pointer underline text-sm">Follow</button>
                </span>
            </div>
            {#if loggedIn}
                {#if comment.liked}
                    <button class="w-6 h-6 min-w-fit min-h-fit ml-auto mr-4 cursor-pointer" aria-label="Like comment" onclick={() => like(comment.id)}><svg xmlns="http://www.w3.org/2000/svg"
     height="48"
     viewBox="0 -960 960 960"
     width="48">
  <path fill="#000080"
        d="M716-120H272v-512l278-288 39 31q6 5 9 14t3 22v10l-45 211h299q24 0 42 18t18 42v81.84q0 7.16 1.5 14.66T915-461L789-171q-8.88 21.25-29.59 36.12Q738.69-120 716-120ZM79-120v-512h193v60H139v392h133v60H79Z"/>
</svg></button>
                {:else}
                    <button class="w-6 h-6 min-w-fit min-h-fit ml-auto mr-4 cursor-pointer" aria-label="Like comment" onclick={() => like(comment.id)}><svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#000080"><path d="M716-120H272v-512l278-288 39 31q6 5 9 14t3 22v10l-45 211h299q24 0 42 18t18 42v81.84q0 7.16 1.5 14.66T915-461L789-171q-8.88 21.25-29.59 36.12Q738.69-120 716-120Zm-384-60h397l126-299v-93H482l53-249-203 214v427Zm0-427v427-427Zm-60-25v60H139v392h133v60H79v-512h193Z"/></svg></button>
                {/if}
            {/if}
        </div>
            <p>{comment.content}</p>
            <p class="text-[#000080]">{comment.likes} {comment.likes == 1 ? "like" : "likes"}</p>
        </div>
    {/each}
</div>

{#if !visible}
    <div class="h-screen w-screen absolute top-0 left-0 z-10 opacity-20 bg-black"></div>
{/if}