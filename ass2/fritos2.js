var fritos = (function() {

    // Helper to get elements from selector or array
    function getElements(selector) {
        if (typeof selector === "string") {
            var nodeList = document.querySelectorAll(selector);
            return Array.prototype.slice.call(nodeList);
        }
        if (Array.isArray(selector)) {
            return selector;
        }
        if (selector instanceof Element) {
            return [selector];
        }
        return [];
    }

    // 4. getParentElements - gets parent of each element
    function getParentElements(selector, filterSelector) {
        var elements = getElements(selector);
        var parents = [];

        for (var i = 0; i < elements.length; i++) {
            var p = elements[i].parentElement;

            if (p !== null && parents.indexOf(p) === -1) {
                if (filterSelector) {
                    if (p.matches(filterSelector)) {
                        parents.push(p);
                    }
                } else {
                    parents.push(p);
                }
            }
        }
        return parents;
    }

    // 5. getAncestors - gets all ancestors up the tree
    function getAncestors(selector, filterSelector) {
        var elements = getElements(selector);
        var ancestors = [];

        for (var i = 0; i < elements.length; i++) {
            var current = elements[i].parentElement;

            while (current !== null) {
                if (ancestors.indexOf(current) === -1) {
                    if (filterSelector) {
                        if (current.matches(filterSelector)) {
                            ancestors.push(current);
                        }
                    } else {
                        ancestors.push(current);
                    }
                }
                current = current.parentElement;
            }
        }
        return ancestors;
    }

    // 6. animateElements - runs CSS animation on elements
    function animateElements(selector, cssProperties, options) {
        var elements = getElements(selector);
        options = options || {};

        // Parse duration
        var duration = options.duration || 400;
        if (typeof duration === "string") {
            duration = parseFloat(duration) * 1000;
        }

        // Parse delay
        var delay = options.delay || 0;
        if (typeof delay === "string") {
            delay = parseFloat(delay) * 1000;
        }

        // Parse iteration count
        var iterations = options.iterationCount || 1;
        if (iterations === "infinite") {
            iterations = Infinity;
        }

        var animationConfig = {
            duration: duration,
            delay: delay,
            easing: options.easing || "ease",
            iterations: iterations,
            fill: options.fillMode || "none"
        };

        for (var i = 0; i < elements.length; i++) {
            elements[i].animate([cssProperties], animationConfig);
        }
    }

    // 7. findDescendants - finds children matching selector
    function findDescendants(selector, childSelector) {
        var elements = getElements(selector);
        var found = [];

        if (!childSelector) {
            return found;
        }

        for (var i = 0; i < elements.length; i++) {
            var matches = elements[i].querySelectorAll(childSelector);
            for (var j = 0; j < matches.length; j++) {
                if (found.indexOf(matches[j]) === -1) {
                    found.push(matches[j]);
                }
            }
        }
        return found;
    }

    // 8. addEventHandler - attaches event listener
    function addEventHandler(selector, eventType, callback) {
        var elements = getElements(selector);

        for (var i = 0; i < elements.length; i++) {
            elements[i].addEventListener(eventType, callback);
        }
    }

    // 9. httpRequest - makes HTTP request to server
    function httpRequest(url, options) {
        var xhr = new XMLHttpRequest();
        var method = options.method || "GET";
        var timeout = options.timeout || 45;

        xhr.open(method, url, true);
        xhr.timeout = timeout * 1000;

        // Set headers
        var headers = options.headers || {};
        for (var key in headers) {
            xhr.setRequestHeader(key, headers[key]);
        }

        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                if (options.onSuccess) {
                    var responseData = xhr.responseText;
                    try {
                        responseData = JSON.parse(responseData);
                    } catch (e) {
                        // Keep as text if not JSON
                    }
                    options.onSuccess(responseData);
                }
            } else {
                if (options.onError) {
                    options.onError(new Error("HTTP " + xhr.status));
                }
            }
        };

        xhr.onerror = function() {
            if (options.onError) {
                options.onError(new Error("Network error"));
            }
        };

        xhr.ontimeout = function() {
            if (options.onError) {
                options.onError(new Error("Timeout"));
            }
        };

        xhr.send(options.body);
    }

    // 10. validateForm - checks form inputs against rules
    function validateForm(containerSelector, rules) {
        var result = {};
        var elements = getElements(containerSelector);
        var container = elements[0];

        if (!container) {
            return result;
        }

        for (var fieldName in rules) {
            var fieldRules = rules[fieldName];

            // Try to find input, textarea, or select with this name
            var input = container.querySelector('input[name="' + fieldName + '"]');
            if (!input) {
                input = container.querySelector('textarea[name="' + fieldName + '"]');
            }
            if (!input) {
                input = container.querySelector('select[name="' + fieldName + '"]');
            }

            if (input) {
                for (var i = 0; i < fieldRules.length; i++) {
                    var rule = fieldRules[i];
                    if (!rule.valid(input.value, container)) {
                        result[fieldName] = rule.message;
                        break;
                    }
                }
            }
        }
        return result;
    }

    // 11. hideElements - makes elements invisible
    function hideElements(selector) {
        var elements = getElements(selector);

        for (var i = 0; i < elements.length; i++) {
            elements[i].classList.add("fritos-hidden");
        }
    }

    // 12. pruneParent - removes parent, keeps element
    function pruneParent(selector) {
        var elements = getElements(selector);

        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            var parent = element.parentElement;

            if (parent !== null && parent.parentElement !== null) {
                parent.parentElement.insertBefore(element, parent);
                parent.remove();
            }
        }
    }

    // 13. raiseElement - moves element up in DOM tree
    function raiseElement(selector, levels) {
        var elements = getElements(selector);
        var times = levels || 1;

        for (var t = 0; t < times; t++) {
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                var parent = element.parentElement;

                if (parent !== null && parent.parentElement !== null) {
                    parent.parentElement.insertBefore(element, parent);
                }
            }
        }
    }

    // 14. setAttributes - sets attribute on elements
    function setAttributes(selector, attributeName, attributeValue) {
        var elements = getElements(selector);

        for (var i = 0; i < elements.length; i++) {
            elements[i].setAttribute(attributeName, attributeValue);
        }
    }

    // 15. getInputValue / setInputValue
    function getInputValue(selector) {
        var elements = getElements(selector);
        if (elements.length > 0) {
            return elements[0].value;
        }
        return undefined;
    }

    function setInputValue(selector, newValue) {
        var elements = getElements(selector);

        for (var i = 0; i < elements.length; i++) {
            elements[i].value = newValue;
        }
    }

    // Return public API
    return {
        select: getElements,
        getParentElements: getParentElements,
        getAncestors: getAncestors,
        animateElements: animateElements,
        findDescendants: findDescendants,
        addEventHandler: addEventHandler,
        httpRequest: httpRequest,
        validateForm: validateForm,
        hideElements: hideElements,
        pruneParent: pruneParent,
        raiseElement: raiseElement,
        setAttributes: setAttributes,
        getInputValue: getInputValue,
        setInputValue: setInputValue
    };
})();
