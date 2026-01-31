let gradient = null;

const DEFAULT_DATA = "https://shroomcoder.github.io/qrStudio/";
const DEFAULT_LOGO = "logo.png";

/* Responsive QR size (NO scaling) */
function getQRSize() {
    return window.innerWidth <= 900 ? 260 : 300;
}

let qr = new QRCodeStyling({
    width: getQRSize(),
    height: getQRSize(),
    type: "svg",
    data: DEFAULT_DATA,
    margin: 20,
    qrOptions: { errorCorrectionLevel: "H" },
    dotsOptions: { type: "square", color: "#000000" },
    cornersSquareOptions: { type: "square" },
    cornersDotOptions: { type: "square" },
    backgroundOptions: { color: "#ffffff" },
    image: DEFAULT_LOGO,
    imageOptions: {
        margin: 14,
        crossOrigin: "anonymous"
    }
});

const qrContainer = document.getElementById("qr");
qr.append(qrContainer);

/* Never expose default URL */
data.value = "";

/* Handle resize without scaling */
window.addEventListener("resize", () => {
    qr.update({
        width: getQRSize(),
        height: getQRSize()
    });
});

/* Collapsibles */
styleToggle.onclick = () => {
    stylePresets.classList.toggle("hidden");
    styleArrow.textContent = stylePresets.classList.contains("hidden") ? "▼" : "▲";
};

gradientToggle.onclick = () => {
    gradientPresets.classList.toggle("hidden");
    gradArrow.textContent = gradientPresets.classList.contains("hidden") ? "▼" : "▲";
};

/* Style presets (NO gradients here) */
const STYLE_PRESETS = {
    soft: { dots: "rounded", cornerSquare: "extra-rounded", cornerDot: "dot" },
    modern: { dots: "extra-rounded", cornerSquare: "square", cornerDot: "dot" },
    classy: { dots: "classy", cornerSquare: "square", cornerDot: "square" },
    premium: { dots: "classy-rounded", cornerSquare: "extra-rounded", cornerDot: "dot" }
};

document.querySelectorAll("[data-style]").forEach(btn => {
    btn.onclick = () => {
        const p = STYLE_PRESETS[btn.dataset.style];

        /* Force Black & White */
        gradient = null;

        dotStyle.value = p.dots;
        cornerSquare.value = p.cornerSquare;
        cornerDot.value = p.cornerDot;

        updateQR(true);
    };
});

/* Gradient presets */
document.querySelectorAll("[data-grad]").forEach(btn => {
    btn.onclick = () => {
        const grad = btn.dataset.grad;

        if (grad === "bw") {
            gradient = null;
            updateQR(true);
            return;
        }

        const [a, b] = grad.split(",");
        gradient = {
            type: "linear",
            rotation: 45,
            colorStops: [
                { offset: 0, color: a },
                { offset: 1, color: b }
            ]
        };

        updateQR(false);
    };
});

const customBtn = document.getElementById("customGradientBtn");
const customPanel = document.getElementById("customGradientPanel");

const colorA = document.getElementById("gradColorA");
const colorB = document.getElementById("gradColorB");
const hexA = document.getElementById("gradHexA");
const hexB = document.getElementById("gradHexB");

/* Toggle custom gradient panel */
customBtn.onclick = () => {
    customPanel.classList.toggle("hidden");
};

/* Sync color picker ↔ hex input */
function syncColorInputs(colorInput, hexInput) {
    colorInput.oninput = () => {
        hexInput.value = colorInput.value;
        applyCustomGradient();
    };

    hexInput.oninput = () => {
        if (/^#([0-9A-F]{3}){1,2}$/i.test(hexInput.value)) {
            colorInput.value = hexInput.value;
            applyCustomGradient();
        }
    };
}

syncColorInputs(colorA, hexA);
syncColorInputs(colorB, hexB);

/* Apply custom gradient */
function applyCustomGradient() {
    gradient = {
        type: "linear",
        rotation: 45,
        colorStops: [
            { offset: 0, color: colorA.value },
            { offset: 1, color: colorB.value }
        ]
    };

    updateQR(false);
}

/* Hide custom panel when preset clicked */
document.querySelectorAll("[data-grad]").forEach(btn => {
    btn.addEventListener("click", () => {
        customPanel.classList.add("hidden");
    });
});


/* Logo picker */
logoBox.onclick = () => logo.click();

logo.onchange = () => {
    const file = logo.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    logoPreview.src = url;
    logoPreview.hidden = false;
    document.querySelector(".logo-placeholder").style.display = "none";

    updateQR();
};

function updateQR(forceBW = false) {
    qr.update({
        data: data.value.trim() || DEFAULT_DATA,
        width: getQRSize(),
        height: getQRSize(),
        margin: 20,
        qrOptions: { errorCorrectionLevel: errorCorrection.value },
        dotsOptions: gradient && !forceBW
            ? { type: dotStyle.value, gradient }
            : { type: dotStyle.value, color: "#000000" },
        cornersSquareOptions: { type: cornerSquare.value },
        cornersDotOptions: { type: cornerDot.value },
        image: logo.files[0]
            ? URL.createObjectURL(logo.files[0])
            : DEFAULT_LOGO,
        imageOptions: {
            margin: parseInt(margin.value) + 6,
            crossOrigin: "anonymous"
        }
    });

    brandCheck.innerHTML =
        errorCorrection.value === "H"
            ? "<span class='good'>✔ Scan-safe default</span>"
            : "<span class='warn'>⚠ Lower error correction may reduce reliability</span>";
}


/* Live updates */
document.querySelectorAll("input, select").forEach(el =>
    el.addEventListener("input", () => updateQR())
);



//    MOBILE DRAWER

const controls = document.querySelector(".controls");
const drawer = document.getElementById("mobileDrawer");
const drawerContent = document.getElementById("drawerContent");

/* Cache ALL sections in original order */
const allSections = Array.from(controls.children);

/* Logical grouping by feature */
const mobileGroups = {
    input: [0, 6],                 // QR input + logo picker
    preset: [1, 2],                // style + gradient
    custom: [3, 4, 5],              // dot, corner box, corner dot ONLY
    download: [7, 8, 9, 10]         // error correction, brand check, size, buttons
};


let activeSections = [];

/* Open drawer */
document.querySelectorAll(".mobile-dock button").forEach(btn => {
    btn.onclick = () => {
        const key = btn.dataset.panel;
        const indexes = mobileGroups[key];
        if (!indexes) return;

        drawerContent.innerHTML = "";
        activeSections = [];

        indexes.forEach(i => {
            const section = allSections[i];
            if (section) {
                activeSections.push(section);
                drawerContent.appendChild(section);
            }
        });

        drawer.classList.remove("hidden");
    };
});

/* Close drawer and restore */
drawer.onclick = e => {
    if (e.target !== drawer) return;

    drawer.classList.add("hidden");

    activeSections.forEach(section => {
        controls.appendChild(section);
    });

    activeSections = [];
};




/* Downloads */
png.onclick = () =>
    qr.download({
        name: "qr-code",
        extension: "png",
        width: parseInt(downloadSize.value),
        height: parseInt(downloadSize.value)
    });

jpg.onclick = () =>
    qr.download({
        name: "qr-code",
        extension: "jpg",
        width: parseInt(downloadSize.value),
        height: parseInt(downloadSize.value)
    });
