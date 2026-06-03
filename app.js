window.addEventListener("resize",()=>{const c=document.getElementById("animCanvas");if(c&&state.currentTopic){const t=TOPICS.find(t=>t.id===state.currentTopic);if(t)startAnimation(t.animation,c);}});
document.addEventListener("keydown",e=>{
    if(e.key==="Escape"){closeAuth();if(document.getElementById("mobileOverlay").classList.contains("show"))toggleSidebar();}
    // FIX #4: Keyboard shortcut clash
    if((e.ctrlKey||e.metaKey)&&e.key==="k"){const a=document.activeElement;if(a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'||a.isContentEditable))return;e.preventDefault();document.getElementById("globalSearch")?.focus();}
});
function init(){applyTheme(state.theme);document.querySelectorAll(".nav-group").forEach(g=>g.classList.add("open"));}
init();