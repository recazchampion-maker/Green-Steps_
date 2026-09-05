(() => {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  const itemRules = {
  plastic: {
    labels: ["plastic", "plastic bottle", "بلاستيك", "زجاجة بلاستيك"],
    ar: "بلاستيك",
    value: 50,
    weight: 0.08,
    risk: "low",
    icon: "♻️",
    recycle: "يفضل فصل البلاستيك وتنظيفه ثم وضعه في نقطة تدوير مناسبة.",
    guide: "نظّف العبوة وأفرغ محتواها، ثم افصل الغطاء إن كانت نقطة التدوير تطلب ذلك."
  },

  paper: {
    labels: ["paper", "ورق"],
    ar: "ورق",
    value: 35,
    weight: 0.12,
    risk: "low",
    icon: "📄",
    recycle: "افصل الورق عن المخلفات المبللة وضعه في نقطة تدوير مناسبة.",
    guide: "حافظ على الورق جافًا ونظيفًا، وأزل الأجزاء غير الورقية قدر الإمكان."
  },

  cardboard: {
    labels: ["cardboard", "كرتون"],
    ar: "كرتون",
    value: 35,
    weight: 0.20,
    risk: "low",
    icon: "📦",
    recycle: "افرد الكرتون ونظفه من بقايا الطعام أو المواد الملوثة ثم ضعه في نقطة تدوير.",
    guide: "حافظ على الكرتون جافًا، وأزل البلاستيك أو الأشرطة اللاصقة الزائدة."
  },

  glass: {
    labels: ["glass", "زجاج"],
    ar: "زجاج",
    value: 40,
    weight: 0.35,
    risk: "medium",
    icon: "🍾",
    recycle: "ضع الزجاج في حاوية أو نقطة تدوير الزجاج، مع تجنب كسر القطع يدويًا.",
    guide: "إذا كان الزجاج مكسورًا، تعامل معه بحذر ولا تمسك القطع الحادة مباشرة."
  },

  metal: {
    labels: ["metal", "can", "aluminum", "معدن", "علبة"],
    ar: "معدن",
    value: 45,
    weight: 0.15,
    risk: "low",
    icon: "🥫",
    recycle: "افصل العلب المعدنية ونظفها ثم ابحث عن أقرب نقطة تدوير.",
    guide: "أفرغ العبوة ونظفها، وتجنب التعامل مع الحواف الحادة دون حماية."
  },

  battery: {
    labels: [
      "battery",
      "bettary",
      "بطارية"
    ],
    ar: "بطارية",
    value: 25,
    weight: 0.05,
    risk: "high",
    icon: "🔋",
    recycle: "البطاريات لا تُعامل مثل القمامة المنزلية العادية؛ استخدم نقطة تجميع أو تدوير مخصصة.",
    guide: "لا تثقب البطارية أو تحرقها أو تفتحها. ضعها في نقطة تجميع مخصصة."
  },

  ewaste: {
    labels: [
      "e-waste",
      "ewaste",
      "electronic",
      "electronics",
      "computer",
      "phone",
      "إلكترونيات",
      "مخلفات إلكترونية"
    ],
    ar: "مخلفات إلكترونية",
    value: 100,
    weight: 0.8,
    risk: "high",
    icon: "💻",
    recycle: "ابحث عن جهة متخصصة في تدوير المخلفات الإلكترونية بدلًا من رميها مع القمامة العادية.",
    guide: "إن أمكن، امسح بياناتك الشخصية من الجهاز قبل تسليمه لجهة موثوقة ولا تفككه بنفسك."
  },

  clothes: {
    labels: [
      "clothes",
      "cloth",
      "shirt",
      "textile",
      "ملابس",
      "قماش"
    ],
    ar: "ملابس / أقمشة",
    value: 80,
    weight: 0.25,
    risk: "low",
    icon: "👕",
    recycle: "يمكن إعادة استخدام الملابس أو تسليمها لجهة تجمع المنسوجات لإعادة التدوير.",
    guide: "اغسلها وجففها قبل التبرع، وإذا كانت غير صالحة للاستخدام فابحث عن حاوية منسوجات."
  },

  organic: {
    labels: [
      "organic",
      "food",
      "food waste",
      "عضوي",
      "طعام"
    ],
    ar: "مخلفات عضوية",
    value: 10,
    weight: 0.3,
    risk: "low",
    icon: "🍎",
    recycle: "يمكن تحويل المخلفات العضوية المناسبة إلى سماد منزلي أو تسليمها لجهة مختصة.",
    guide: "افصلها عن البلاستيك والزجاج والمعادن، وتجنب خلطها بمواد كيميائية."
  },

};

  const state = {
    model: null, maxPredictions: 0, imageData: null, currentKey: "plastic",
    predictionLabel: "Plastic", confidence: 0.94, condition: null,
    stats: JSON.parse(localStorage.getItem("greenStepsStats") || '{"reused":0,"recycled":0,"avoided":0,"kg":0,"activities":[]}')
  };

  function toast(msg) {
    const el = $("#toast"); el.textContent = msg; el.classList.add("show");
    clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("show"), 2600);
  }

  function saveStats() {
    if (!Array.isArray(state.stats.activities)) state.stats.activities = [];
    localStorage.setItem("greenStepsStats", JSON.stringify(state.stats));
    updateStatsUI();
    renderActivities();
  }

  function addActivity(action, icon, detail) {
    if (!Array.isArray(state.stats.activities)) state.stats.activities = [];
    state.stats.activities.unshift({
      action, icon, detail,
      item: itemRules[state.currentKey]?.ar || state.predictionLabel,
      value: itemRules[state.currentKey]?.value ?? null,
      image: state.imageData || null,
      time: new Date().toLocaleString("ar-EG", {day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit"})
    });
    state.stats.activities = state.stats.activities.slice(0, 12);
  }

  function renderActivities() {
    const el = $("#activityList");
    if (!el) return;
    const list = state.stats.activities || [];
    if (!list.length) { el.innerHTML = '<div class="empty-activity">لسه مفيش خطوات مسجلة. ابدئي بإضافة أول حاجة! 💚</div>'; return; }
    el.innerHTML = list.map(a => `
      <article class="activity-item">
        <div class="activity-thumb">${a.image ? `<img src="${a.image}" alt="${a.item || 'العنصر'}">` : `<span>${a.icon}</span>`}</div>
        <div class="activity-info">
          <div class="activity-topline"><b>${a.action}</b><span class="activity-tag">${a.action.includes("تبرع") ? "تبرع" : a.action.includes("تبديل") ? "تبديل" : "إعادة تدوير"}</span></div>
          <strong class="activity-item-name">${a.item || a.detail}</strong>
          ${a.value != null ? `<p class="activity-value">القيمة التقديرية: <b>${a.value} جنيه</b></p>` : ""}
          <small>${a.time}</small>
        </div>
      </article>`).join("");
  }

  function updateStatsUI() {
    const s = state.stats;
    $("#homeReused").textContent = s.reused;
    $("#homeRecycled").textContent = s.recycled;
    $("#homeAvoided").textContent = `${s.kg.toFixed(1)} kg`;
    $("#impactReused").textContent = s.reused;
    $("#impactRecycled").textContent = s.recycled;
    $("#impactAvoided").textContent = s.avoided;
    $("#impactKg").textContent = `${s.kg.toFixed(1)} kg`;
    const steps = s.reused + s.recycled;
    $("#levelText").textContent = `${Math.min(steps,5)} / 5 خطوات`;
    $("#impactProgress").style.width = `${Math.min(steps/5*100,100)}%`;
  }

  function showScreen(id) {
    $$(".screen").forEach(s => s.classList.toggle("active", s.id === id));
    $$(".nav a").forEach(a => a.classList.toggle("active", a.dataset.screen === id));
    if (id === "impact") { updateStatsUI(); renderActivities(); }
    if (id === "guide") renderGuides();
    window.location.hash = id;
    window.scrollTo({top:0, behavior:"smooth"});
    $("#mainNav").classList.remove("open");
  }

  document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-screen]");
    if (target) { e.preventDefault(); showScreen(target.dataset.screen); }
  });

  $("#mobileMenuBtn").addEventListener("click", () => $("#mainNav").classList.toggle("open"));
  $("#languageBtn").addEventListener("click", () => toast("الواجهة الإنجليزية الكاملة يمكن تفعيلها في النسخة القادمة."));

  // Upload
  const imageInput = $("#imageInput"), imagePreview = $("#imagePreview");
  imageInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.imageData = reader.result;
      imagePreview.src = state.imageData;
      imagePreview.hidden = false; $("#uploadPlaceholder").hidden = true;
      $("#analyzeBtn").disabled = false; stopCamera();
      toast("تم تحميل الصورة بنجاح 🌱");
    };
    reader.readAsDataURL(file);
  });

  let cameraStream = null;
  let cameraReady = false;
  $("#cameraBtn").addEventListener("click", async () => {
    if (cameraStream && cameraReady) {
      captureCamera();
      return;
    }
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("getUserMedia unavailable");
      }

      cameraReady = false;
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30, max: 30 }
        },
        audio: false
      });

      const video = $("#cameraVideo");
      video.srcObject = cameraStream;
      video.hidden = false;
      imagePreview.hidden = true;
      $("#uploadPlaceholder").hidden = true;
      $("#stopCameraBtn").hidden = false;
      $("#cameraBtn").textContent = "📸 التقاط الصورة";

      await new Promise(resolve => {
        if (video.readyState >= 2) return resolve();
        video.addEventListener("loadedmetadata", resolve, { once: true });
      });
      await video.play();

      // Ask supported mobile cameras to keep focus/exposure continuous.
      const track = cameraStream.getVideoTracks()[0];
      if (track?.applyConstraints) {
        try {
          await track.applyConstraints({
            advanced: [
              { focusMode: "continuous" },
              { exposureMode: "continuous" }
            ]
          });
        } catch (_) {
          // Some browsers/cameras do not expose these controls; keep the stream running.
        }
      }
      cameraReady = true;
      toast("الكاميرا جاهزة — ثبتي الموبايل وخلي العنصر واضحًا 📸");
    } catch (err) {
      console.error("Camera error:", err);
      stopCamera();
      toast("الكاميرا لم تفتح. تأكدي من السماح للمتصفح باستخدام الكاميرا، أو ارفعي صورة بدلًا منها.");
    }
  });
  $("#stopCameraBtn").addEventListener("click", stopCamera);
  function stopCamera() {
    if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
    cameraReady = false;
    const video = $("#cameraVideo");
    video.pause();
    video.srcObject = null;
    video.hidden = true;
    $("#stopCameraBtn").hidden = true;
    $("#cameraBtn").textContent = "📷 فتح الكاميرا";
  }
  function captureCamera() {
    const video = $("#cameraVideo"), canvas = $("#captureCanvas");
    if (!cameraStream || !cameraReady || video.videoWidth < 320 || video.videoHeight < 240) {
      toast("استني لحظة لحد ما الكاميرا تجهز بالكامل 📸");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d", { alpha: false });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    state.imageData = canvas.toDataURL("image/jpeg", 0.94);
    imagePreview.src = state.imageData;
    imagePreview.hidden = false;
    $("#uploadPlaceholder").hidden = true;
    $("#analyzeBtn").disabled = false;
    stopCamera();
    toast("تم التقاط صورة بجودة عالية 📸");
  }

  async function loadModel(url) {
    if (!url) return false;
    if (!window.tmImage) throw new Error("Teachable Machine library لم يتم تحميلها.");
    const base = url.endsWith("/") ? url : url + "/";
    state.model = await tmImage.load(base + "model.json", base + "metadata.json");
    state.maxPredictions = state.model.getTotalClasses();
    $("#modelStatus").classList.add("connected");
    $("#modelStatus").innerHTML = '<span class="status-dot"></span><span>الموديل متصل ويعمل الآن</span>';
    return true;
  }

  async function analyze() {
    if (!state.imageData) return;
    $("#analyzeBtn").disabled = true;
    $("#analyzeBtn").textContent = "جاري التحليل...";
    try {
      let best = {label:"Plastic", probability:.94};
      if (state.model) {
        const predictions = await state.model.predict(imagePreview);

console.log("ALL PREDICTIONS:");
console.table(
    predictions.map(p => ({
        className: p.className,
        probability: p.probability
    }))
);

best = [...predictions]
    .sort((a, b) => b.probability - a.probability)[0];
    if (best.probability < 0.50) {
  toast("الموديل مش متأكد من الصورة. قرّبي العنصر وخليه ظاهر بالكامل وجربي تاني.");
  return;
}
      } else {
        toast("الموديل مش متصل. افتحي إعداد الموديل وتأكدّي من الرابط قبل التحليل.");
        return;
      }
      const normalized = normalizeLabel(best.className || best.label);

if (!normalized || !itemRules[normalized]) {
  toast(`لم نتعرف على نوع المخلف: ${best.className || best.label}`);
  return;
}

state.currentKey = normalized;
state.predictionLabel = best.className || best.label;
state.confidence = best.probability;
      $("#analysisImage").src = state.imageData;
      $("#resultType").textContent = itemRules[normalized]?.ar || prettifyLabel(best.label);
      $("#confidenceText").textContent = `${Math.round(best.probability*100)}%`;
      $("#confidenceBar").style.width = `${Math.round(best.probability*100)}%`;
      showScreen("analysis");
    } catch (err) {
      console.error(err); toast("حصلت مشكلة في الموديل. راجعي رابط Teachable Machine.");
    } finally {
      $("#analyzeBtn").disabled = false; $("#analyzeBtn").textContent = "تحليل الصورة 🤖";
    }
  }
  $("#analyzeBtn").addEventListener("click", analyze);

  function normalizeLabel(label) {
    const s = String(label).toLowerCase().trim();
    const compact = s.replace(/[\s_-]+/g, " ");

    for (const [key, rule] of Object.entries(itemRules)) {
      const matched = rule.labels.some(x => {
        const candidate = String(x).toLowerCase().trim().replace(/[\s_-]+/g, " ");
        return compact === candidate || compact.includes(candidate) || candidate.includes(compact);
      });
      if (matched) return key;
    }

    // Common English model labels that may vary slightly between exports.
    const aliases = {
      plastic: ["plastic bottle", "bottle", "plastics"],
      paper: ["paper waste", "newspaper"],
      cardboard: ["cardboard box", "carton"],
      glass: ["glass bottle", "jar"],
      metal: ["metal can", "aluminium", "aluminum can"],
      battery: ["batteries"],
      ewaste: ["e waste", "electronic waste", "electronics waste"],
      clothes: ["clothing", "fabric", "textiles"],
      organic: ["organic waste", "food waste"]
    };
    for (const [key, values] of Object.entries(aliases)) {
      if (values.some(v => compact === v || compact.includes(v))) return key;
    }

    console.warn("Unknown model class:", label);
    return null;
  }
  function prettifyLabel(s){ return String(s).replace(/[-_]/g," ").replace(/\b\w/g,c=>c.toUpperCase()); }

  // Conditions
  $$(".condition-btn").forEach(btn => btn.addEventListener("click", () => {
    state.condition = btn.dataset.condition;
    if (state.condition === "good") {
      $("#goodItemName").textContent = itemRules[state.currentKey].ar;
      $("#estimatedValue").textContent = `${itemRules[state.currentKey].value} جنيه`;
      showScreen("good");
    } else {
      setupBadScreen();
      if (state.condition === "fair") toast("حالة تحتاج إصلاح: ابدئي بإصلاحه أو إعادة استخدامه قبل التخلص منه.");
      showScreen("bad");
    }
  }));

  function setupBadScreen() {
    const rule = itemRules[state.currentKey];
    $("#badItemName").textContent = rule.ar;
    $("#riskIcon").textContent = rule.icon;
    $("#recycleText").textContent = rule.recycle;
    $("#safeGuideText").textContent = rule.guide;
    const riskMap = {low:["خطورة منخفضة","low"],medium:["خطورة متوسطة","medium"],high:["خطورة مرتفعة","high"]};
    const [text, cls] = riskMap[rule.risk];
    $("#riskLevel").textContent = text;
    $("#riskLevel").style.background = cls==="high" ? "#ffe1dc" : cls==="medium" ? "#fff0cf" : "#e9f6e9";
    $("#riskLevel").style.color = cls==="high" ? "#9a4035" : cls==="medium" ? "#8d6814" : "#2d7b43";
    $("#guideSubtitle").textContent = `إرشادات ${rule.ar}`;
  }

  $("#donateBtn").addEventListener("click", () => {
    const rule = itemRules[state.currentKey];
    state.stats.reused += 1; state.stats.avoided += 1; state.stats.kg += rule.weight;
    addActivity("تم تجهيز عنصر للتبرع 🎁", "🎁", `${rule.ar} • تم حفظ الخطوة في نشاطك البيئي.`);
    saveStats();
    toast("تمت إضافة العنصر لقائمة التبرع الخاصة بك 🎁");
    setTimeout(() => showScreen("impact"), 650);
  });
  $("#exchangeBtn").addEventListener("click", () => {
    const rule = itemRules[state.currentKey];
    state.stats.reused += 1; state.stats.avoided += 1; state.stats.kg += rule.weight;
    addActivity("تمت إضافة عنصر للتبديل 🔄", "🔄", `${rule.ar} • يمكنك متابعة الخطوة من صفحة أثرك البيئي.`);
    saveStats();
    toast("تمت إضافة العنصر لقائمة التبديل الخاصة بك 🔄");
    setTimeout(() => showScreen("impact"), 650);
  });

  function openMap(type) {
    const queryMap = {
      recycle: `${itemRules[state.currentKey].ar} recycling center`,
      disposal: `${itemRules[state.currentKey].ar} waste disposal`
    };
    if (!navigator.geolocation) {
      const q = encodeURIComponent(queryMap[type]); window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank"); return;
    }
    $("#locationStatus").textContent = "جاري تحديد موقعك...";
    navigator.geolocation.getCurrentPosition(pos => {
      const q = encodeURIComponent(queryMap[type]);
      const {latitude,longitude} = pos.coords;
      window.open(`https://www.google.com/maps/search/?api=1&query=${q}&center=${latitude},${longitude}`, "_blank");
      $("#locationStatus").textContent = "تم تحديد موقعك وفتح نتائج الأماكن القريبة.";
    }, () => {
      $("#locationStatus").textContent = "تعذر الحصول على الموقع؛ تم فتح البحث العام عن الأماكن المناسبة.";
      const q = encodeURIComponent(queryMap[type]); window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
    }, {enableHighAccuracy:true,timeout:9000});
  }
  const recycleModal = $("#recycleModal");
  function closeRecycleModal(){ recycleModal.classList.remove("open"); recycleModal.setAttribute("aria-hidden","true"); }
  function openRecycleModal(){
    const rule = itemRules[state.currentKey];
    $("#recycleModalTitle").textContent = `إيه أفضل طريقة لتدوير ${rule.ar}؟ ♻️`;
    $("#homeRecycleIdea").hidden = true;
    recycleModal.classList.add("open"); recycleModal.setAttribute("aria-hidden","false");
  }
  $("#recycleBtn").addEventListener("click", openRecycleModal);
  $("#closeRecycleModal").addEventListener("click", closeRecycleModal);
  recycleModal.addEventListener("click", e => { if (e.target === recycleModal) closeRecycleModal(); });

  function registerRecycle(){
    const rule = itemRules[state.currentKey];
    state.stats.recycled += 1; state.stats.avoided += 1; state.stats.kg += rule.weight;
    addActivity("تمت إضافة عنصر لإعادة التدوير ♻️", "♻️", `${rule.ar} • تم تسجيل الخطوة في نشاطك البيئي.`);
    saveStats();
  }

  $("#recycleMapChoice").addEventListener("click", () => { registerRecycle(); closeRecycleModal(); openMap("recycle"); });
  $("#youtubeRecycleChoice").addEventListener("click", () => {
    const rule = itemRules[state.currentKey];
    registerRecycle();
    const q = encodeURIComponent(`how to recycle ${rule.ar} DIY reuse`);
    window.open(`https://www.youtube.com/results?search_query=${q}`, "_blank");
    closeRecycleModal();
    toast("فتحنا لكِ فيديوهات إعادة التدوير على YouTube ▶️");
  });
  $("#homeRecycleChoice").addEventListener("click", () => {
    const rule = itemRules[state.currentKey];
    const ideas = {
      plastic: {title:"حوّلي البلاستيك لحاجة مفيدة", text:"نظفي العبوة وجففيها، ثم استخدميها كأصيص صغير للنباتات أو منظم للأقلام. ثبتيها جيدًا وتجنبي استخدام العبوات التالفة أو الحادة.", image:"assets/ideas/plastic-pot.svg"},
      paper: {title:"اصنعي ورقًا جديدًا أو ديكورًا", text:"استخدمي الورق الجاف لصناعة بطاقات، كولاج، أو ورق معاد الاستخدام. اجمعي القصاصات واصنعي منها مشروعًا فنيًا بسيطًا.", image:"assets/ideas/cardboard-box.svg"},
      cardboard: {title:"الكرتون = منظم جديد", text:"قصي الكرتون ونظفيه، ثم اصنعي صندوقًا للكتب أو منظمًا للمكتب. غلّفيه بورق قديم ليصبح شكله أجمل.", image:"assets/ideas/cardboard-box.svg"},
      glass: {title:"استخدمي الزجاج كديكور", text:"إذا كانت العبوة سليمة وغير مكسورة، اغسليها جيدًا وحوليها إلى مزهرية أو برطمان للتخزين. لا تستخدمي الزجاج المكسور في مشروع منزلي.", image:"assets/ideas/glass-vase.svg"},
      metal: {title:"علبة معدنية = منظم صغير", text:"نظفي العلبة وأزيلي الحواف الحادة أو غطيها جيدًا، ثم استخدميها لحفظ الأقلام أو الأدوات الصغيرة.", image:"assets/ideas/cardboard-box.svg"},
      clothes: {title:"جددي استخدام الملابس", text:"الملابس القديمة يمكن تحويلها إلى أكياس قماش، قطع تنظيف، أو إكسسوارات بسيطة بدل التخلص منها.", image:"assets/ideas/clothes-bag.svg"},
      organic: {title:"ابدئي كومبوست بسيط", text:"بعض بقايا الخضار والفواكه المناسبة يمكن تحويلها إلى سماد عضوي. افصليها عن البلاستيك والمواد الكيميائية وتعلمي الطريقة المناسبة أولًا.", image:"assets/ideas/plastic-pot.svg"},
      battery: {title:"البطارية ليست للتدوير المنزلي", text:"لا تفتحي البطارية ولا تثقبيها أو تحرقيها. أفضل خطوة هي تسليمها لنقطة تجميع متخصصة.", image:"assets/ideas/glass-vase.svg"},
      ewaste: {title:"الإلكترونيات تحتاج جهة متخصصة", text:"لا تفككي الجهاز في المنزل. امسحي بياناتك الشخصية، ثم سلّميه لجهة موثوقة لإعادة الاستخدام أو التدوير.", image:"assets/ideas/cardboard-box.svg"}
    };
    const idea = ideas[state.currentKey] || {title:"فكرة لإعادة الاستخدام", text:rule.recycle, image:`${rule.icon} ♻️`};
    const box = $("#homeRecycleIdea");
    box.innerHTML = `<img class="idea-picture" src="${idea.image}" alt="فكرة إعادة تدوير ${rule.ar}"><div><span class="tag">HOME DIY</span><h3>${idea.title}</h3><p>${idea.text}</p><div class="tips"><b>💡 نصيحة:</b> ${rule.guide}</div></div><button class="small-btn" id="saveHomeRecycleBtn">سجلت الخطوة ♻️</button>`;
    box.hidden = false;
    $("#saveHomeRecycleBtn").addEventListener("click", () => { registerRecycle(); closeRecycleModal(); toast("برافو! اتسجلت خطوة إعادة الاستخدام في أثرك 🌱"); setTimeout(()=>showScreen("impact"),500); });
  });

  $("#disposalBtn").addEventListener("click", () => openMap("disposal"));
  $("#guideBtn").addEventListener("click", () => showScreen("guide"));

  function renderGuides() {
    const rule = itemRules[state.currentKey];
    const common = [
      ["♻️","افصل المخلفات","افصل البلاستيك والورق والزجاج والمعادن عن المخلفات العضوية قدر الإمكان.","عام"],
      ["🧤","السلامة أولًا","استخدم وسائل حماية مناسبة مع الأشياء الحادة أو المكسورة ولا تحاول تفكيك المواد الخطرة.","سلامة"],
      ["📍","النقطة المناسبة","استخدم نقطة تجميع أو تدوير متخصصة عندما يكون المخلف بطارية أو إلكترونيات أو مادة حساسة.","مهم"]
    ];
    const selected = [
      [rule.icon, `إرشادات ${rule.ar}`, rule.guide, "للعنصر الحالي"],
      ["🌱","أفضل خيار","إن كان العنصر ما زال قابلًا للاستخدام، فإعادة الاستخدام أو التبرع غالبًا أفضل من التخلص منه.","Green Steps"]
    ];
    $("#guideGrid").innerHTML = [...selected,...common].map(x=>`<article class="guide-item"><span class="tag">${x[3]}</span><div style="font-size:30px;margin-top:8px">${x[0]}</div><h3>${x[1]}</h3><p>${x[2]}</p></article>`).join("");
  }

  // Model settings
  const modal = $("#modelModal");
  $("#modelSettingsBtn").addEventListener("click", () => {
    $("#modelUrlInput").value = localStorage.getItem("greenStepsModelUrl") || APP_CONFIG.modelUrl || "";
    modal.classList.add("open"); modal.setAttribute("aria-hidden","false");
  });
  $("#closeModal").addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  function closeModal(){ modal.classList.remove("open"); modal.setAttribute("aria-hidden","true"); }
  $("#clearModelBtn").addEventListener("click", () => {
    localStorage.removeItem("greenStepsModelUrl"); state.model = null;
    $("#modelStatus").classList.remove("connected");
    $("#modelStatus").innerHTML = '<span class="status-dot"></span><span>وضع التجربة: الموديل غير موصل بعد</span>';
    closeModal(); toast("تم تفعيل وضع Demo.");
  });
  $("#saveModelBtn").addEventListener("click", async () => {
    const url = $("#modelUrlInput").value.trim();
    if (!url) { toast("اكتبي رابط الموديل أولًا."); return; }
    try {
      await loadModel(url); localStorage.setItem("greenStepsModelUrl",url); closeModal(); toast("تم توصيل Teachable Machine بنجاح 🤖");
    } catch(e) { console.error(e); toast("الرابط غير صالح أو الموديل غير متاح."); }
  });

  // Initial model
  async function bootModel() {
    const url = localStorage.getItem("greenStepsModelUrl") || APP_CONFIG.modelUrl;
    if (!url) return;
    try { await loadModel(url); } catch(e) { console.warn(e); }
  }

  // Notifications
  $("#notificationsBtn").addEventListener("click", () => toast("🌱 نصيحة اليوم: إعادة الاستخدام تسبق التدوير في رحلة الاستدامة."));
  updateStatsUI(); renderActivities(); renderGuides(); bootModel();

  const initial = location.hash.replace("#","");
  if (initial && document.getElementById(initial)) showScreen(initial);
  else showScreen("splash");
})();
