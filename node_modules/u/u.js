(function(root, factory) {
    if(typeof exports === 'object') {
        module.exports = factory();
    }
    else if(typeof define === 'function' && define.amd) {
        define('u', [], factory);
    }
    else {
        root.u = factory();
    }
}(this, function() {
var u,
  __hasProp = {}.hasOwnProperty,
  __slice = [].slice;

u = {
  each: function(collection, fn) {
    var key, value, _i, _len;
    if (typeof collection.length !== 'undefined') {
      for (key = _i = 0, _len = collection.length; _i < _len; key = ++_i) {
        value = collection[key];
        fn(value, key);
      }
    } else {
      for (key in collection) {
        if (!__hasProp.call(collection, key)) continue;
        value = collection[key];
        fn(value, key);
      }
    }
    return void 0;
  },
  extend: function() {
    var key, obj, other, others, _i, _len;
    obj = arguments[0], others = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (obj && others) {
      for (_i = 0, _len = others.length; _i < _len; _i++) {
        other = others[_i];
        for (key in other) {
          obj[key] = other[key];
        }
      }
    }
    return obj;
  },
  fluent: function(fn) {
    return function() {
      fn.apply(this, arguments);
      return this;
    };
  },
  one: function(collection) {
    var id;
    for (id in collection) {
      return id;
    }
  },
  keys: function(object) {
    var key, keys;
    keys = [];
    for (key in object) {
      if (!__hasProp.call(object, key)) continue;
      keys.push(key);
    }
    return keys;
  },
  classList: {
    add: function(element, className) {
      if (!u.classList.contains(element, className)) {
        if (element.className.baseVal != null) {
          return element.setAttribute('class', "" + element.className.baseVal + " className");
        } else {
          return element.className += " " + className;
        }
      }
    },
    remove: function(element, className) {
      var regex;
      regex = new RegExp("(^|\\s)" + className + "(?:\\s|$)");
      if (element.className.baseVal != null) {
        return element.setAttribute('class', (element.className.baseVal + '').replace(regex, '$1'));
      } else {
        return element.className = (element.className + '').replace(regex, '$1');
      }
    },
    toggle: function(element, className) {
      var verb;
      if (u.classList.contains(element, className)) {
        verb = 'remove';
      } else {
        verb = 'add';
      }
      return u.classList[verb](element, className);
    },
    contains: function(element, className) {
      var cName;
      if (element.className.baseVal != null) {
        cName = element.className.baseVal;
      } else {
        cName = element.className;
      }
      return (cName.indexOf(className)) > -1;
    }
  }
};

    return u;
}));
