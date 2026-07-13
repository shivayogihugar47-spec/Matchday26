console.log("Testing backend import...");

try {
  import('./knowledgeBase.js').then(({ default: kb }) => {
    console.log("SUCCESS: Imported knowledge base!", kb.venue.name);
  }).catch(err => {
    console.error("ERROR importing knowledge base:", err);
  });
  
  import('./api/[...slug].js').then(mod => {
    console.log("SUCCESS: Imported api/[...slug].js!");
  }).catch(err => {
    console.error("ERROR importing api/[...slug].js:", err);
  });
} catch (err) {
  console.error("Test error:", err);
}
