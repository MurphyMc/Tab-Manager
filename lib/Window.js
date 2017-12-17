var Window = React.createFactory(React.createClass({
  render:function(){
    chrome.tabs.getSelected(null, this.scrollToTab);

    var hideWindow = true;
    var tabsperrow = this.props.layout=="blocks"?Math.ceil(Math.sqrt(this.props.tabs.length+2)):(this.props.layout=="vertical"?1:15);
    var tabs = this.props.tabs.map(tab => {
      var isHidden = !!this.props.hiddenTabs[tab.id] && this.props.filterTabs;
      var isSelected = !!this.props.selection[tab.id];
      hideWindow &= isHidden;
      return Tab({
        window:this.props.window,
        layout:this.props.layout,
        tab:tab,
        selected:isSelected,
        hidden:isHidden,
        middleClick:this.props.tabMiddleClick,
        select:this.props.select,
        drag:this.props.drag,
        drop:this.props.drop,
        ref:"tab"+tab.id
      });
    });
    this.tabs = tabs.slice(0);
    if(!hideWindow) {
      tabs.push(React.DOM.div({className:"icon close "+(this.props.layout == "blocks"?"":"windowaction"),onClick:this.close,title:"Close Selected"}));
      //tabs.push(React.DOM.div({className:"icon add "+(this.props.layout == "blocks"?"":"windowaction"),onClick:this.addTab}));
      tabs.push(React.DOM.div({className:"icon bookmark "+(this.props.layout == "blocks"?"":"windowaction"),onClick:this.bookmark,title:"Bookmark Selected"}));
      tabs.push(React.DOM.div({className:"icon selectall "+(this.props.layout == "blocks"?"":"windowaction"),onClick:this.selectAll,title:"Select All"}));
      var children = [];
      for(var j = 0; j < tabs.length; j++){
        if(j % tabsperrow == 0 && j && (j < tabs.length-2 || this.props.layout == "blocks")){
          children.push(React.DOM.div({className:"newliner"}));
        }
        children.push(tabs[j]);
      }
      return React.DOM.div({className:"window "+(this.props.layout == "blocks"?"block":"")}, children);
    } else {
      return null;
    }
  },
  scrollToTab:function(tab){
    var ref = "tab" + tab.id;
    var t = this.refs[ref];
    if (t) t.getDOMNode().scrollIntoView();
  },
  addTab:function(){
    chrome.tabs.create({windowId:this.props.window.id});
  },
  bookmark:function(){
    tabs = this.tabs.filter( tab => {
      return tab.props.selected;
    });
    if (tabs.length == 0) return;
    tabs = tabs.map( tab => {
      //console.log(tab);
      return {url:tab.props.tab.url, title:tab.props.tab.title};
    });

    var now = new Date();
    var t = now.toLocaleDateString("en-US", {"hour12":true, "hour":"2-digit", "minute":"2-digit", "second":"2-digit"});
    t = t.split(",");
    t = t[1].trim();
    var d = now.toISOString().split("T")[0];
    chrome.runtime.sendMessage({type:'bookmark', tabs:tabs, default_name:d + " " + t});
  },
  close:function(){
    this.tabs = this.tabs.filter( tab => {
      if (tab.props.selected)
      {
        chrome.tabs.remove(tab.props.tab.id);
        return false;
      }
    });
  },
  selectAll:function(e){
    if (e.nativeEvent.shiftKey)
    {
      this.tabs.map( tab => {
        tab.props.select(tab.props.tab.id);
      });
      return;
    }
    var s = true;
    this.tabs.map( tab => {
      s = s && tab.props.selected;
    });

    this.tabs.map( tab => {
      if (s == tab.props.selected) tab.props.select(tab.props.tab.id);
    });
  }
}));
