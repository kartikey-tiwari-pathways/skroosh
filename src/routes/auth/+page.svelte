<script>
    import { goto } from "$app/navigation";
    import { auth, db } from "$lib";
    import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
    import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";

    let loginForm;
    let signupForm;
    let loading = $state(false);
    
    async function login() {
        loading = true;
        try {
            signInWithEmailAndPassword(auth, loginForm.email.value, loginForm.password.value);
            goto("/");
        } catch (err) {
            console.error(err);
            alert(err);
        }
        loading = false;
    }

    function isValidUsername(username) {
        const regex = /^[a-z0-9_-]+$/;
        return regex.test(username);
    }

    async function signup() {
        loading = true;
        try {
            if (!isValidUsername(signupForm.username.value)) throw new Error("Bad username! Your username must not contain spaces, must be lowercase, and must not contain any special characters apart from underscores and hyphens!");
            const userQuery = query(collection(db, "users"), where("username", "==", signupForm.username.value));
            const userSnapshot = await getDocs(userQuery);
            if (!userSnapshot.empty) {
                throw new Error("An account already exists with this username!");
            }
            const user = await createUserWithEmailAndPassword(auth, signupForm.email.value, signupForm.password.value);
            const userRef = doc(db, "users", user.user.uid);
            await setDoc(userRef, {
                communities: [],
                created_at: serverTimestamp(),
                following: [],
                username: signupForm.username.value
            });
            goto("/");
        } catch (err) {
            console.error(err);
            alert(err);
        }
        loading = false;
    }

    function cleanUsername(displayName) {
    return displayName
        .toLowerCase()
        .replace(/\s+/g, "-")          // spaces -> hyphens
        .replace(/[^a-z0-9_-]/g, "")   // remove invalid chars
        .replace(/-+/g, "-")           // collapse multiple hyphens
        .replace(/^-+|-+$/g, "");      // trim leading/trailing hyphens
    }

    async function giveAvailableUsername(username) {
        const userQuery = query(collection(db, "users"), where("username", "==", username));
        const userSnapshot = await getDocs(userQuery);
        if (userSnapshot.empty) {
            return username;
        } else {
            return giveAvailableUsername(`${username}-${Math.floor(Math.random()*10000)}`);
        }
    }

    async function google() {
        loading = true;
        try {
            const user = await signInWithPopup(auth, new GoogleAuthProvider());
            const userRef = doc(db, "users", user.user.uid);
            const userSnapshot = await getDoc(userRef);
            if (!userSnapshot.exists()) {
                await setDoc(userRef, {
                    communities: [],
                    created_at: serverTimestamp(),
                    following: [],
                    username: await giveAvailableUsername(cleanUsername(user.user.displayName))
                });
            }
            goto("/");
        } catch (err) {
            console.error(err);
            alert(err);
        }
        loading = false;
    }
</script>

<div class="flex flex-col items-center gap-10 mt-4">
    <!-- svelte-ignore event_directive_deprecated -->
    <form on:submit|preventDefault={login} bind:this={loginForm} class="flex flex-col items-center w-full gap-2">
        <p class="text-4xl">Login</p>
        <input class="bg-[#E8E8E8] rounded-[15px] p-2 text-black placeholder:text-[#808080] w-80" required placeholder="Email..." name="email" />
        <input class="bg-[#E8E8E8] rounded-[15px] p-2 text-black placeholder:text-[#808080] w-80" required placeholder="Password..." name="password" />
        <button type="submit" class="bg-[#000080] rounded-[15px] text-white px-4 py-2 cursor-pointer">Log in</button>
    </form>

    <!-- svelte-ignore event_directive_deprecated -->
    <form on:submit|preventDefault={signup} bind:this={signupForm} class="flex flex-col items-center w-full gap-2">
        <p class="text-4xl">Sign up</p>
        <input class="bg-[#E8E8E8] rounded-[15px] p-2 text-black placeholder:text-[#808080] w-80" required placeholder="Username..." name="username" />
        <input class="bg-[#E8E8E8] rounded-[15px] p-2 text-black placeholder:text-[#808080] w-80" required placeholder="Email..." name="email" />
        <input class="bg-[#E8E8E8] rounded-[15px] p-2 text-black placeholder:text-[#808080] w-80" required placeholder="Password..." name="password" />
        <button type="submit" class="bg-[#000080] rounded-[15px] text-white px-4 py-2 cursor-pointer">Sign up</button>
    </form>

    <div>
        <p class="text-4xl text-center mb-4">Alternatively,</p>
        <!-- svelte-ignore event_directive_deprecated -->
        <button on:click={google} class="bg-[#000080] rounded-[15px] flex items-center gap-2 px-4 py-2 cursor-pointer">
            <img class="w-10 h-10" src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Google_Favicon_2025.svg/500px-Google_Favicon_2025.svg.png" alt="google logo" />
            <p class="text-xl text-white">Continue with Google</p>
        </button>
    </div>
</div>

{#if loading}
<div class="h-screen w-screen absolute top-0 left-0 z-10 opacity-20 bg-black"></div>
{/if}