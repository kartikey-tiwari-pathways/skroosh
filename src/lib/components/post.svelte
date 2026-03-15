<script>
    import { db } from "$lib";
    import userImage from "$lib/assets/user.png";
    import { doc, getDoc } from "firebase/firestore";
    let { id } = $props();

    let visible = $state(false);
    let postData = $state({
        author_id: 0,
        content: "Loading",
        created_at: Date.now(),
        liker_ids: [1],
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
    getPostData() // Uncomment when actually working on it
</script>
{#if visible}
    <div class="bg-[#E8E8E8] w-1/2 h-fit p-6 rounded-[15px]">
        <div class="flex items-center gap-2">
            <img src={userImage} alt="user" class="w-10 h-10 rounded-full">
            <span>
                <p>{authorUsername}</p>
                <button class="text-blue-500 cursor-pointer underline text-sm">Follow</button>
            </span>
        </div>
        <p class="text-2xl">{postData.title}</p>
        <p class="text-base">{postData.content}</p>
    </div>
{/if}