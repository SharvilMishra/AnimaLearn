window.addEventListener("popstate",e=>{
    if(e.state)navigate(e.state.page,e.state.param,true);
    else navigate("dashboard",null,true);
});

window.addEventListener("resize",()=>{const c=document.getElementById("animCanvas");if(c&&state.currentTopic){const t=TOPICS.find(t=>t.id===state.currentTopic);if(t)startAnimation(t.animation,c);}});

document.addEventListener("keydown",e=>{
    if(e.key==="Escape"){
        if(state.notifOpen)toggleNotifDropdown();
        closeAuth();closeFeedback();
        if(document.getElementById("mobileOverlay").classList.contains("show"))toggleSidebar();
    }
    if((e.ctrlKey||e.metaKey)&&e.key==="k"){const a=document.activeElement;if(a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'||a.isContentEditable))return;e.preventDefault();document.getElementById("globalSearch")?.focus();}
});

document.addEventListener("click",e=>{
    if(state.notifOpen && !e.target.closest("#notifBellBtn") && !e.target.closest("#notifDropdown"))toggleNotifDropdown();
});

function init(){applyTheme(state.theme);document.querySelectorAll(".nav-group").forEach(g=>g.classList.add("open"));}
init();
