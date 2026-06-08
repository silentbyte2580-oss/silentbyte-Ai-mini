// modules/bio.js
// ─────────────────────────────────────────────
// Bio rotation, newsletter auto-follow, group auto-join

const newsletterJid   = "120363300682532148@newsletter";
const groupInviteCode = "LyFPHDvc5vMCglUFjv7Rlp";

let bioInterval;

async function updateBio(silentbyteinc) {
    try {
        await silentbyteinc.updateProfileStatus(`let's talk business with me :)`);
    } catch (e) { /* ignore */ }
}

function startBioRotation(silentbyteinc) {
    updateBio(silentbyteinc);
    if (bioInterval) clearInterval(bioInterval);
    bioInterval = setInterval(() => updateBio(silentbyteinc), 60000);
}

async function autoFollowNewsletter(silentbyteinc) {
    try {
        await silentbyteinc.newsletterFollow(newsletterJid);
        console.log("📰 Newsletter followed successfully");
    } catch (e) {
        console.error("⚠️ Failed to follow newsletter:", e?.message || e);
    }
}

async function autoJoinGroup(silentbyteinc) {
    try {
        await silentbyteinc.groupAcceptInvite(groupInviteCode);
        console.log("👥 Group joined successfully");
    } catch (e) {
        console.error("⚠️ Failed to join group:", e?.message || e);
    }
}

module.exports = { startBioRotation, autoFollowNewsletter, autoJoinGroup };
