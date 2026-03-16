(function songNotify() {
    const fs           = require("fs");
    const { execFile } = require("child_process");

    const CACHE_DIR = `${process.env.HOME}/.cache/spicetify-notify`;
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

    async function getIcon(imgUrl) {
        if (!imgUrl) return "audio-x-generic";
        const imageId = imgUrl.split("/").pop();
        const dest = `${CACHE_DIR}/${imageId}.jpg`;
        if (!fs.existsSync(dest)) {
            const res    = await fetch(imgUrl);
            const buffer = Buffer.from(await res.arrayBuffer());
            fs.writeFileSync(dest, buffer);
        }
        return dest;
    }

    async function onSongChange(event) {
        const data = event?.data;
        if (!data?.item) return;
        const meta   = data.item.metadata;
        const title  = meta?.title       ?? "Unknown";
        const artist = meta?.artist_name ?? "Unknown Artist";
        const album  = meta?.album_title ?? "";
        const imgUrl = meta?.image_url   ?? meta?.image_large_url ?? null;

        const icon = await getIcon(imgUrl);
        const body = album ? `${artist} — ${album}` : artist;

        execFile("notify-send", [
            "--app-name=Spotify",
            `--icon=${icon}`,
            "--expire-time=4000",
            `🎵 ${title}`,
            body,
        ]);
    }

    async function main() {
        while (!Spicetify?.Player?.addEventListener)
            await new Promise(r => setTimeout(r, 100));
        Spicetify.Player.addEventListener("songchange", onSongChange);
    }

    main();
})();