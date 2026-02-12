var fritos = (function() {

    function wrapElements(arr) {
        return {
            elements: arr,

            // 4. parent()
            parent: function(selector) {
                var list = [];

                for (var i = 0; i < this.elements.length; i++) {
                    var p = this.elements[i].parentElement;

                    if (p !== null) {
                        if (list.indexOf(p) === -1) {
                            if (selector) {
                                if (p.matches(selector)) {
                                    list.push(p);
                                }
                            } else {
                                list.push(p);
                            }
                        }
                    }
                }
                return wrapElements(list);
            },

            // 5. ancestor()
            ancestor: function(selector) {
                var list = [];

                for (var i = 0; i < this.elements.length; i++) {
                    var a = this.elements[i].parentElement;

                    while (a !== null) {
                        if (list.indexOf(a) === -1) {
                            if (selector) {
                                if (a.matches(selector)) {
                                    list.push(a);
                                }
                            } else {
                                list.push(a);
                            }
                        }
                        a = a.parentElement;
                    }
                }
                return wrapElements(list);
            },

            // 6. animate()
            animate: function(css, opts) {
                opts = opts || {};

                var dur = opts.duration || 400;
                if (typeof dur === "string") {
                    dur = parseFloat(dur) * 1000;
                }

                var del = opts.delay || 0;
                if (typeof del === "string") {
                    del = parseFloat(del) * 1000;
                }

                var iter = opts.iterationCount || 1;
                if (iter === "infinite") {
                    iter = Infinity;
                }

                var conf = {
                    duration: dur,
                    delay: del,
                    easing: opts.easing || "ease",
                    iterations: iter,
                    fill: opts.fillMode || "none"
                };

                for (var i = 0; i < this.elements.length; i++) {
                    this.elements[i].animate([css], conf);
                }
                return this;
            },

            // 7. find()
            find: function(selector) {
                if (!selector) {
                    return wrapElements([]);
                }
                var list = [];

                for (var i = 0; i < this.elements.length; i++) {
                    var kids = this.elements[i].querySelectorAll(selector);
                    for (var j = 0; j < kids.length; j++) {
                        if (list.indexOf(kids[j]) === -1) {
                            list.push(kids[j]);
                        }
                    }
                }
                return wrapElements(list);
            },

            // 8. onEvent()
            onEvent: function(type, func) {
                for (var i = 0; i < this.elements.length; i++) {
                    this.elements[i].addEventListener(type, func);
                }
                return this;
            },

            // 10. validation()
            validation: function(rules) {
                var result = {};
                var box = this.elements[0];

                if (!box) {
                    return result;
                }

                for (var name in rules) {
                    var r = rules[name];
                    var el = box.querySelector('input[name="' + name + '"]');

                    if (!el) {
                        el = box.querySelector('textarea[name="' + name + '"]');
                    }
                    if (!el) {
                        el = box.querySelector('select[name="' + name + '"]');
                    }

                    if (el) {
                        for (var i = 0; i < r.length; i++) {
                            if (!r[i].valid(el.value, box)) {
                                result[name] = r[i].message;
                                break;
                            }
                        }
                    }
                }
                return result;
            },

            // 11. hide()
            hide: function() {
                for (var i = 0; i < this.elements.length; i++) {
                    this.elements[i].style.display = "none";
                }
                return this;
            },

            // 12. prune()
            prune: function() {
                for (var i = 0; i < this.elements.length; i++) {
                    var el = this.elements[i];
                    var p = el.parentElement;

                    if (p !== null && p.parentElement !== null) {
                        p.parentElement.insertBefore(el, p);
                        p.remove();
                    }
                }
                return this;
            },

            // 13. raise()
            raise: function(level) {
                var times = level || 1;

                for (var t = 0; t < times; t++) {
                    for (var i = 0; i < this.elements.length; i++) {
                        var el = this.elements[i];
                        var p = el.parentElement;

                        if (p !== null && p.parentElement !== null) {
                            p.parentElement.insertBefore(el, p);
                        }
                    }
                }
                return this;
            },

            // 14. attrs()
            attrs: function(name, val) {
                for (var i = 0; i < this.elements.length; i++) {
                    this.elements[i].setAttribute(name, val);
                }
                return this;
            },

            // 15. val()
            val: function(v) {
                if (v === undefined) {
                    if (this.elements.length > 0) {
                        return this.elements[0].value;
                    }
                    return undefined;
                }
                for (var i = 0; i < this.elements.length; i++) {
                    this.elements[i].value = v;
                }
                return this;
            }
        };
    }

    function select(selector) {
        var arr = [];
        if (typeof selector === "string") {
            var nodes = document.querySelectorAll(selector);
            arr = Array.prototype.slice.call(nodes);
        }
        return wrapElements(arr);
    }

    // 9. remoteCall()
    select.remoteCall = function(url, opts) {
        var xhr = new XMLHttpRequest();
        var m = opts.method || "GET";
        var t = opts.timeout || 45;

        xhr.open(m, url, true);
        xhr.timeout = t * 1000;

        var h = opts.headers || {};
        for (var k in h) {
            xhr.setRequestHeader(k, h[k]);
        }

        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                if (opts.onSuccess) {
                    var data = xhr.responseText;
                    try {
                        data = JSON.parse(data);
                    } catch (e) {}
                    opts.onSuccess(data);
                }
            } else {
                if (opts.onError) {
                    opts.onError(new Error("HTTP " + xhr.status));
                }
            }
        };

        xhr.onerror = function() {
            if (opts.onError) {
                opts.onError(new Error("Network error"));
            }
        };

        xhr.ontimeout = function() {
            if (opts.onError) {
                opts.onError(new Error("Timeout"));
            }
        };

        xhr.send(opts.body);
    };

    return select;
})();
