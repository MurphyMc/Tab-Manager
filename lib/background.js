chrome.runtime.onMessage.addListener(function(request)
{
  if (request.type === 'bookmark')
  {
    do_bookmark(request);
  }
  else if (request.type === 'delete')
  {
    do_delete(request);
  }
});

function do_delete (request)
{
  tabs = request.tabs;
  var r = confirm("Are you sure you want to delete " + tabs.length + " tab"
                  + (tabs.length == 1 ? "?" : "s?"));
  if (!r) return;
  for(var i = 0; i < tabs.length; i++){
    chrome.tabs.remove(tabs[i].id);
  }
}

function do_bookmark (request)
{
  var tabs = request.tabs;
  var folder = prompt("Please select a name for the folder in which to create "
                      + tabs.length + " bookmark" + (tabs.length == 1 ? "." : "s."),
                      request.default_name);
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

  if (request.close)
  {
    var r = confirm("Are you sure you want to delete " + tabs.length + " tab"
                    + (tabs.length == 1 ? "?" : "s?"));
    if (r)
    {
      tabs.filter(tab => {
        chrome.tabs.remove(tab.id);
      });
    }
  }
}
