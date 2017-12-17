chrome.runtime.onMessage.addListener(function(request)
{
  if (request.type === 'bookmark')
  {
    do_bookmark(request);
  }
});

function do_bookmark (request)
{
  tabs = request.tabs;
  var folder = prompt("Please select a name for the folder in which to create " + tabs.length + " bookmark" + (tabs.length == 1 ? "." : "s."), request.default_name);
  if (!folder) return;

  chrome.bookmarks.search({title:"Saved Tabs"}, function(results) {
    if (results === undefined)
    {
      alert("Please create a bookmark folder called 'Saved Tabs' and then try again.");
      return;
    }
    if (results.length !== 1)
    {
      alert("There is more than one bookmark folder called 'Saved Tabs'; I don't know which to use.  Sorry!");
      return;
    }
    var root = results[0];
    chrome.bookmarks.create({parentId:root.id, title:folder}, function (node) {
      tabs.map( tab => {
        chrome.bookmarks.create({parentId:node.id, title:tab.title, url:tab.url});
      });
    });
  });
}
