const screenshotData = [
    {
        src: "1.jpg",
        title: "Dashboard, console, and server control",
        caption: "Realtime status cards, graph views, server controls, and the docked console."
    },
    {
        src: "2.jpg",
        title: "File, world, and plugin workflows",
        caption: "Manage server files, worlds, plugins, backups, and administrative actions from the panel."
    },
    {
        src: "3.jpg",
        title: "Players, inventory, and live tracking",
        caption: "Inspect player state, follow movement, review activity, and manage inventories without switching tools."
    },
    {
        src: "4.jpg",
        title: "Permissions, audit, and account tooling",
        caption: "Create users and roles, review audit history, and keep sensitive actions behind clear permissions."
    },
    {
        src: "5.jpg",
        title: "Themes, logs, and advanced utilities",
        caption: "Appearance controls, activity logs, failed-auth review, schedules, and long-tail admin pages."
    }
];

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.16 });

document.querySelectorAll(".reveal").forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 6, 5) * 55}ms`;
    revealObserver.observe(element);
});

let activeShot = 0;

function renderShot(index) {
    const image = document.querySelector("[data-shot-image]");
    const title = document.querySelector("[data-shot-title]");
    const caption = document.querySelector("[data-shot-caption]");
    const dots = document.querySelectorAll("[data-shot-dot]");
    if (!image || !title || !caption) return;

    activeShot = (index + screenshotData.length) % screenshotData.length;
    const shot = screenshotData[activeShot];
    image.classList.remove("is-missing");
    image.src = shot.src;
    image.alt = shot.title;
    title.textContent = shot.title;
    caption.textContent = shot.caption;
    dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === activeShot));
}

document.querySelector("[data-shot-prev]")?.addEventListener("click", () => renderShot(activeShot - 1));
document.querySelector("[data-shot-next]")?.addEventListener("click", () => renderShot(activeShot + 1));
document.querySelectorAll("[data-shot-dot]").forEach((dot) => {
    dot.addEventListener("click", () => renderShot(Number(dot.dataset.shotDot) || 0));
});

document.querySelector("[data-shot-image]")?.addEventListener("error", (event) => {
    event.currentTarget.classList.add("is-missing");
    event.currentTarget.src = createMissingImageDataUrl();
});

function createMissingImageDataUrl() {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675">
            <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                    <stop stop-color="#0b8cff" stop-opacity=".28"/>
                    <stop offset=".52" stop-color="#10264a"/>
                    <stop offset="1" stop-color="#07101f"/>
                </linearGradient>
                <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
                    <circle cx="4" cy="4" r="1.5" fill="#8eb1e0" opacity=".42"/>
                </pattern>
            </defs>
            <rect width="1200" height="675" fill="url(#bg)"/>
            <rect width="1200" height="675" fill="url(#dots)"/>
            <rect x="90" y="86" width="1020" height="503" rx="38" fill="#0b172b" opacity=".72" stroke="#1e90ff"/>
            <text x="600" y="310" fill="#f4f8ff" font-size="58" font-family="Arial, sans-serif" font-weight="700" text-anchor="middle">Preview image not found</text>
            <text x="600" y="376" fill="#a6b5ca" font-size="26" font-family="Arial, sans-serif" text-anchor="middle">Preview media is currently unavailable.</text>
        </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

document.querySelectorAll(".magnet").forEach((button) => {
    button.addEventListener("mousemove", (event) => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        button.style.transform = `translate(${x * 0.08}px, ${y * 0.12}px)`;
    });
    button.addEventListener("mouseleave", () => {
        button.style.transform = "";
    });
});

document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `rotateX(${6 - y * 5}deg) rotateY(${-8 + x * 8}deg) translateY(-6px)`;
    });
    card.addEventListener("mouseleave", () => {
        card.style.transform = "";
    });
});

renderShot(0);
