<script>
    import { db } from "$lib";
    import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
    import Post from "$lib/components/post.svelte";
    let posts = $state([]);
    async function getPostsData() {
        const postsCollection = collection(db, "posts");
        const postsQuery = query(postsCollection, orderBy("created_at", "desc"), limit(50));
        try {
            const postsSnap = await getDocs(postsQuery);
            postsSnap.forEach(doc => {
                posts = [...posts, doc.id];
            });
        } catch (err) {
            console.error(err);
        }
    }
    getPostsData();
</script>

<div class="flex flex-col items-center w-full h-full mt-10">
    {#each posts as id}
        <Post {id} />
    {/each}
</div>