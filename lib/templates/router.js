RouterClass = function(routes) {
  this.url = window.location.toString().split('/').slice(0, 3).join('/');
  
  var OrderedHash = function() {
    this.keys = [];
    this.values = [];

    this.indexOfKey = function(key) {
      for(var i=0; i<this.keys.length; i++){
          if(this.keys[i] == key){
              return i;
          }
      }
      return -1;
    };
    
    this.set = function(key, value) {
      var index = this.indexOfKey(key);
      if(index >= 0) {
        this.values[index] = value;
      } else {
        this.keys.push(key);
        this.values.push(value);
      }
    };
    
    this.get = function(key) {
      var index = this.indexOfKey(key);
      if(index >= 0) {
        return this.values[index];
      } else {
        return null;
      }
    };
    
    this.each = function(callback) {
      for(var i = 0; i < this.keys.length; i++) {
        callback(this.keys[i], this.values[i]);
      }
    };
  };
  
  this.resolveArguments = function(def, allArgs) {
    var i;
    var args = allArgs;
    var options = {};
    var urlOptions = new OrderedHash();
    
    // extract options
    if (allArgs.length > 0) {
      var last = allArgs[allArgs.length-1];
      if (typeof(last) === "object") {
        options = last;
        args = [];
        for (i = 0; i < allArgs.length - 1; i++) {
          args.push(allArgs[i]);
        }
      }
    }
    
    for (i = 0; i < args.length; i++) {
      var key = def.keys[i];
      var value = args[i];
      urlOptions.set(key, value);
    }
    
    for (var k in options) {
      if (true) { // mute JSlint
        urlOptions.set(k, options[k]);
      }
    }
    
    return urlOptions;
  };
  
  this.cleanupPath = function(path) {
    return path.replace(/\(.*(\:[a-z0-9_]+).*\)/g, "").replace(/[\(\)]/g, "");
  };
  
  this.bindRoute = function(key, def) {
    this[key] = function() {
      var args = this.resolveArguments(def, arguments);
      var path = def.path;
      var data = [];
      
      args.each(function(k,v) {
        if(path.search(k) >= 0) {
          path = path.replace(new RegExp(':'+k), encodeURIComponent(v));
        } else {
          data.push(k + '=' + encodeURIComponent(v));
        }
      });
      
      var route = this.cleanupPath(path);
      
      if (data.length > 0) {
        data = data.join('&');
        if (route.indexOf('?') > 0) {
          route += data;
        } else {
          route += '?' + data;
        }
      }
      return route;
    };

    this[key + '_path'] = function() {
      return this[key].apply(this, arguments);
    };

    this[key + '_url'] = function() {
      var route = this[key + '_path'].apply(this, arguments);
      return this.url + route;
    };
  };
  
  for (var key in routes) {
    if (true) { // mute JSlint
      this.bindRoute(key, routes[key]);
    }
  }
  
  this.named_routes = routes;
};

%global% = new RouterClass(%routes%);
