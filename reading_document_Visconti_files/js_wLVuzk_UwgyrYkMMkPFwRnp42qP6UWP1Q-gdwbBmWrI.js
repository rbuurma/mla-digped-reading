/*
** Annotator v1.2.9
** https://github.com/okfn/annotator/
**
** Copyright 2013, the Annotator project contributors.
** Dual licensed under the MIT and GPLv3 licenses.
** https://github.com/okfn/annotator/blob/master/LICENSE
**
** Built at: 2013-12-02 17:58:01Z
 */
 ! 
function() {
	var $,
	Annotator,
	Delegator,
	LinkParser,
	Range,
	Util,
	base64Decode,
	base64UrlDecode,
	createDateFromISO8601,
	findChild,
	fn,
	functions,
	g,
	getNodeName,
	getNodePosition,
	gettext,
	parseToken,
	simpleXPathJQuery,
	simpleXPathPure,
	_Annotator,
	_gettext,
	_i,
	_j,
	_len,
	_len1,
	_ref,
	_ref1,
	_t,
	__slice = [].slice,
	__hasProp = {}.hasOwnProperty,
	__extends = function(child, parent) {
		for (var key in parent) {
			if (__hasProp.call(parent, key)) child[key] = parent[key]
		}
		function ctor() {
			this.constructor = child
		}
		ctor.prototype = parent.prototype;
		child.prototype = new ctor;
		child.__super__ = parent.prototype;
		return child
	},
	__bind = function(fn, me) {
		return function() {
			return fn.apply(me, arguments)
		}
	},
	__indexOf = [].indexOf || 
	function(item) {
		for (var i = 0, l = this.length; i < l; i++) {
			if (i in this && this[i] === item) return i
		}
		return - 1
	};
	simpleXPathJQuery = function(relativeRoot) {
		var jq;
		jq = this.map(function() {
			var elem,
			idx,
			path,
			tagName;
			path = "";
			elem = this;
			while ((elem != null ? elem.nodeType: void 0) === Node.ELEMENT_NODE && elem !== relativeRoot) {
				tagName = elem.tagName.replace(":", "\\:");
				idx = $(elem.parentNode).children(tagName).index(elem) + 1;
				idx = "[" + idx + "]";
				path = "/" + elem.tagName.toLowerCase() + idx + path;
				elem = elem.parentNode
			}
			return path
		});
		return jq.get()
	};
	simpleXPathPure = function(relativeRoot) {
		var getPathSegment,
		getPathTo,
		jq,
		rootNode;
		getPathSegment = function(node) {
			var name,
			pos;
			name = getNodeName(node);
			pos = getNodePosition(node);
			return "" + name + "[" + pos + "]"
		};
		rootNode = relativeRoot;
		getPathTo = function(node) {
			var xpath;
			xpath = "";
			while (node !== rootNode) {
				if (node == null) {
					throw new Error("Called getPathTo on a node which was not a descendant of @rootNode. " + rootNode)
				}
				xpath = getPathSegment(node) + "/" + xpath;
				node = node.parentNode
			}
			xpath = "/" + xpath;
			xpath = xpath.replace(/\/$/, "");
			return xpath
		};
		jq = this.map(function() {
			var path;
			path = getPathTo(this);
			return path
		});
		return jq.get()
	};
	findChild = function(node, type, index) {
		var child,
		children,
		found,
		name,
		_i,
		_len;
		if (!node.hasChildNodes()) {
			throw new Error("XPath error: node has no children!")
		}
		children = node.childNodes;
		found = 0;
		for (_i = 0, _len = children.length; _i < _len; _i++) {
			child = children[_i];
			name = getNodeName(child);
			if (name === type) {
				found += 1;
				if (found === index) {
					return child
				}
			}
		}
		throw new Error("XPath error: wanted child not found.")
	};
	getNodeName = function(node) {
		var nodeName;
		nodeName = node.nodeName.toLowerCase();
		switch (nodeName) {
		case "#text":
			return "text()";
		case "#comment":
			return "comment()";
		case "#cdata-section":
			return "cdata-section()";
		default:
			return nodeName
		}
	};
	getNodePosition = function(node) {
		var pos,
		tmp;
		pos = 0;
		tmp = node;
		while (tmp) {
			if (tmp.nodeName === node.nodeName) {
				pos++
			}
			tmp = tmp.previousSibling
		}
		return pos
	};
	gettext = null;
	if (typeof Gettext !== "undefined" && Gettext !== null) {
		_gettext = new Gettext({
			domain: "annotator"
		});
		gettext = function(msgid) {
			return _gettext.gettext(msgid)
		}
	} else {
		gettext = function(msgid) {
			return msgid
		}
	}
	_t = function(msgid) {
		return gettext(msgid)
	};
	if (! (typeof jQuery !== "undefined" && jQuery !== null ? (_ref = jQuery.fn) != null ? _ref.jquery: void 0: void 0)) {
		console.error(_t("Annotator requires jQuery: have you included lib/vendor/jquery.js?"))
	}
	if (! (JSON && JSON.parse && JSON.stringify)) {
		console.error(_t("Annotator requires a JSON implementation: have you included lib/vendor/json2.js?"))
	}
	$ = jQuery;
	Util = {};
	Util.flatten = function(array) {
		var flatten;
		flatten = function(ary) {
			var el,
			flat,
			_i,
			_len;
			flat = [];
			for (_i = 0, _len = ary.length; _i < _len; _i++) {
				el = ary[_i];
				flat = flat.concat(el && $.isArray(el) ? flatten(el) : el)
			}
			return flat
		};
		return flatten(array)
	};
	Util.contains = function(parent, child) {
		var node;
		node = child;
		while (node != null) {
			if (node === parent) {
				return true
			}
			node = node.parentNode
		}
		return false
	};
	Util.getTextNodes = function(jq) {
		var getTextNodes;
		getTextNodes = function(node) {
			var nodes;
			if (node && node.nodeType !== Node.TEXT_NODE) {
				nodes = [];
				if (node.nodeType !== Node.COMMENT_NODE) {
					node = node.lastChild;
					while (node) {
						nodes.push(getTextNodes(node));
						node = node.previousSibling
					}
				}
				return nodes.reverse()
			} else {
				return node
			}
		};
		return jq.map(function() {
			return Util.flatten(getTextNodes(this))
		})
	};
	Util.getLastTextNodeUpTo = function(n) {
		var result;
		switch (n.nodeType) {
		case Node.TEXT_NODE:
			return n;
		case Node.ELEMENT_NODE:
			if (n.lastChild != null) {
				result = Util.getLastTextNodeUpTo(n.lastChild);
				if (result != null) {
					return result
				}
			}
			break
		}
		n = n.previousSibling;
		if (n != null) {
			return Util.getLastTextNodeUpTo(n)
		} else {
			return null
		}
	};
	Util.getFirstTextNodeNotBefore = function(n) {
		var result;
		switch (n.nodeType) {
		case Node.TEXT_NODE:
			return n;
		case Node.ELEMENT_NODE:
			if (n.firstChild != null) {
				result = Util.getFirstTextNodeNotBefore(n.firstChild);
				if (result != null) {
					return result
				}
			}
			break
		}
		n = n.nextSibling;
		if (n != null) {
			return Util.getFirstTextNodeNotBefore(n)
		} else {
			return null
		}
	};
	Util.readRangeViaSelection = function(range) {
		var sel;
		sel = Util.getGlobal().getSelection();
		sel.removeAllRanges();
		sel.addRange(range.toRange());
		return sel.toString()
	};
	Util.xpathFromNode = function(el, relativeRoot) {
		var exception,
		result;
		try {
			result = simpleXPathJQuery.call(el, relativeRoot)
		} catch(_error) {
			exception = _error;
			console.log("jQuery-based XPath construction failed! Falling back to manual.");
			result = simpleXPathPure.call(el, relativeRoot)
		}
		return result
	};
	Util.nodeFromXPath = function(xp, root) {
		var idx,
		name,
		node,
		step,
		steps,
		_i,
		_len,
		_ref1;
		steps = xp.substring(1).split("/");
		node = root;
		for (_i = 0, _len = steps.length; _i < _len; _i++) {
			step = steps[_i];
			_ref1 = step.split("["),
			name = _ref1[0],
			idx = _ref1[1];
			idx = idx != null ? parseInt((idx != null ? idx.split("]") : void 0)[0]) : 1;
			node = findChild(node, name.toLowerCase(), idx)
		}
		return node
	};
	Util.escape = function(html) {
		return html.replace(/&(?!\w+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
	};
	Util.uuid = function() {
		var counter;
		counter = 0;
		return function() {
			return counter++
		}
	} ();
	Util.getGlobal = function() {
		return function() {
			return this
		} ()
	};
	Util.maxZIndex = function($elements) {
		var all,
		el;
		all = function() {
			var _i,
			_len,
			_results;
			_results = [];
			for (_i = 0, _len = $elements.length; _i < _len; _i++) {
				el = $elements[_i];
				if ($(el).css("position") === "static") {
					_results.push( - 1)
				} else {
					_results.push(parseFloat($(el).css("z-index")) || -1)
				}
			}
			return _results
		} ();
		return Math.max.apply(Math, all)
	};
	Util.mousePosition = function(e, offsetEl) {
		var offset,
		_ref1;
		if ((_ref1 = $(offsetEl).css("position")) !== "absolute" && _ref1 !== "fixed" && _ref1 !== "relative") {
			offsetEl = $(offsetEl).offsetParent()[0]
		}
		offset = $(offsetEl).offset();
		return {
			top: e.pageY - offset.top,
			left: e.pageX - offset.left
		}
	};
	Util.preventEventDefault = function(event) {
		return event != null ? typeof event.preventDefault === "function" ? event.preventDefault() : void 0: void 0
	};
	functions = ["log", "debug", "info", "warn", "exception", "assert", "dir", "dirxml", "trace", "group", "groupEnd", "groupCollapsed", "time", "timeEnd", "profile", "profileEnd", "count", "clear", "table", "error", "notifyFirebug", "firebug", "userObjects"];
	if (typeof console !== "undefined" && console !== null) {
		if (console.group == null) {
			console.group = function(name) {
				return console.log("GROUP: ", name)
			}
		}
		if (console.groupCollapsed == null) {
			console.groupCollapsed = console.group
		}
		for (_i = 0, _len = functions.length; _i < _len; _i++) {
			fn = functions[_i];
			if (console[fn] == null) {
				console[fn] = function() {
					return console.log(_t("Not implemented:") + (" console." + name))
				}
			}
		}
	} else {
		this.console = {};
		for (_j = 0, _len1 = functions.length; _j < _len1; _j++) {
			fn = functions[_j];
			this.console[fn] = function() {}
		}
		this.console["error"] = function() {
			var args;
			args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
			return alert("ERROR: " + args.join(", "))
		};
		this.console["warn"] = function() {
			var args;
			args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
			return alert("WARNING: " + args.join(", "))
		}
	}
	Delegator = function() {
		Delegator.prototype.events = {};
		Delegator.prototype.options = {};
		Delegator.prototype.element = null;
		function Delegator(element, options) {
			this.options = $.extend(true, {},
			this.options, options);
			this.element = $(element);
			this._closures = {};
			this.on = this.subscribe;
			this.addEvents()
		}
		Delegator.prototype.destroy = function() {
			return this.removeEvents()
		};
		Delegator.prototype.addEvents = function() {
			var event,
			_k,
			_len2,
			_ref1,
			_results;
			_ref1 = Delegator._parseEvents(this.events);
			_results = [];
			for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
				event = _ref1[_k];
				_results.push(this._addEvent(event.selector, event.event, event.functionName))
			}
			return _results
		};
		Delegator.prototype.removeEvents = function() {
			var event,
			_k,
			_len2,
			_ref1,
			_results;
			_ref1 = Delegator._parseEvents(this.events);
			_results = [];
			for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
				event = _ref1[_k];
				_results.push(this._removeEvent(event.selector, event.event, event.functionName))
			}
			return _results
		};
		Delegator.prototype._addEvent = function(selector, event, functionName) {
			var closure;
			closure = function(_this) {
				return function() {
					return _this[functionName].apply(_this, arguments)
				}
			} (this);
			if (selector === "" && Delegator._isCustomEvent(event)) {
				this.subscribe(event, closure)
			} else {
				this.element.delegate(selector, event, closure)
			}
			this._closures["" + selector + "/" + event + "/" + functionName] = closure;
			return this
		};
		Delegator.prototype._removeEvent = function(selector, event, functionName) {
			var closure;
			closure = this._closures["" + selector + "/" + event + "/" + functionName];
			if (selector === "" && Delegator._isCustomEvent(event)) {
				this.unsubscribe(event, closure)
			} else {
				this.element.undelegate(selector, event, closure)
			}
			delete this._closures["" + selector + "/" + event + "/" + functionName];
			return this
		};
		Delegator.prototype.publish = function() {
			this.element.triggerHandler.apply(this.element, arguments);
			return this
		};
		Delegator.prototype.subscribe = function(event, callback) {
			var closure;
			closure = function() {
				return callback.apply(this, [].slice.call(arguments, 1))
			};
			closure.guid = callback.guid = $.guid += 1;
			this.element.bind(event, closure);
			return this
		};
		Delegator.prototype.unsubscribe = function() {
			this.element.unbind.apply(this.element, arguments);
			return this
		};
		return Delegator
	} ();
	Delegator._parseEvents = function(eventsObj) {
		var event,
		events,
		functionName,
		sel,
		selector,
		_k,
		_ref1;
		events = [];
		for (sel in eventsObj) {
			functionName = eventsObj[sel];
			_ref1 = sel.split(" "),
			selector = 2 <= _ref1.length ? __slice.call(_ref1, 0, _k = _ref1.length - 1) : (_k = 0, []),
			event = _ref1[_k++];
			events.push({
				selector: selector.join(" "),
				event: event,
				functionName: functionName
			})
		}
		return events
	};
	Delegator.natives = function() {
		var key,
		specials,
		val;
		specials = function() {
			var _ref1,
			_results;
			_ref1 = jQuery.event.special;
			_results = [];
			for (key in _ref1) {
				if (!__hasProp.call(_ref1, key)) continue;
				val = _ref1[key];
				_results.push(key)
			}
			return _results
		} ();
		return "blur focus focusin focusout load resize scroll unload click dblclick\nmousedown mouseup mousemove mouseover mouseout mouseenter mouseleave\nchange select submit keydown keypress keyup error".split(/[^a-z]+/).concat(specials)
	} ();
	Delegator._isCustomEvent = function(event) {
		event = event.split(".")[0];
		return $.inArray(event, Delegator.natives) === -1
	};
	Range = {};
	Range.sniff = function(r) {
		if (r.commonAncestorContainer != null) {
			return new Range.BrowserRange(r)
		} else if (typeof r.start === "string") {
			return new Range.SerializedRange(r)
		} else if (r.start && typeof r.start === "object") {
			return new Range.NormalizedRange(r)
		} else {
			console.error(_t("Could not sniff range type"));
			return false
		}
	};
	Range.nodeFromXPath = function(xpath, root) {
		var customResolver,
		evaluateXPath,
		namespace,
		node,
		segment;
		if (root == null) {
			root = document
		}
		evaluateXPath = function(xp, nsResolver) {
			var exception;
			if (nsResolver == null) {
				nsResolver = null
			}
			try {
				return document.evaluate("." + xp, root, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
			} catch(_error) {
				exception = _error;
				console.log("XPath evaluation failed.");
				console.log("Trying fallback...");
				return Util.nodeFromXPath(xp, root)
			}
		};
		if (!$.isXMLDoc(document.documentElement)) {
			return evaluateXPath(xpath)
		} else {
			customResolver = document.createNSResolver(document.ownerDocument === null ? document.documentElement: document.ownerDocument.documentElement);
			node = evaluateXPath(xpath, customResolver);
			if (!node) {
				xpath = function() {
					var _k,
					_len2,
					_ref1,
					_results;
					_ref1 = xpath.split("/");
					_results = [];
					for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
						segment = _ref1[_k];
						if (segment && segment.indexOf(":") === -1) {
							_results.push(segment.replace(/^([a-z]+)/, "xhtml:$1"))
						} else {
							_results.push(segment)
						}
					}
					return _results
				} ().join("/");
				namespace = document.lookupNamespaceURI(null);
				customResolver = function(ns) {
					if (ns === "xhtml") {
						return namespace
					} else {
						return document.documentElement.getAttribute("xmlns:" + ns)
					}
				};
				node = evaluateXPath(xpath, customResolver)
			}
			return node
		}
	};
	Range.RangeError = function(_super) {
		__extends(RangeError, _super);
		function RangeError(type, message, parent) {
			this.type = type;
			this.message = message;
			this.parent = parent != null ? parent: null;
			RangeError.__super__.constructor.call(this, this.message)
		}
		return RangeError
	} (Error);
	Range.BrowserRange = function() {
		function BrowserRange(obj) {
			this.commonAncestorContainer = obj.commonAncestorContainer;
			this.startContainer = obj.startContainer;
			this.startOffset = obj.startOffset;
			this.endContainer = obj.endContainer;
			this.endOffset = obj.endOffset
		}
		BrowserRange.prototype.normalize = function(root) {
			var n,
			node,
			nr,
			r;
			if (this.tainted) {
				console.error(_t("You may only call normalize() once on a BrowserRange!"));
				return false
			} else {
				this.tainted = true
			}
			r = {};
			if (this.startContainer.nodeType === Node.ELEMENT_NODE) {
				r.start = Util.getFirstTextNodeNotBefore(this.startContainer.childNodes[this.startOffset]);
				r.startOffset = 0
			} else {
				r.start = this.startContainer;
				r.startOffset = this.startOffset
			}
			if (this.endContainer.nodeType === Node.ELEMENT_NODE) {
				node = this.endContainer.childNodes[this.endOffset];
				if (node != null) {
					n = node;
					while (n != null && n.nodeType !== Node.TEXT_NODE) {
						n = n.firstChild
					}
					if (n != null) {
						r.end = n;
						r.endOffset = 0
					}
				}
				if (r.end == null) {
					node = this.endContainer.childNodes[this.endOffset - 1];
					r.end = Util.getLastTextNodeUpTo(node);
					r.endOffset = r.end.nodeValue.length
				}
			} else {
				r.end = this.endContainer;
				r.endOffset = this.endOffset
			}
			nr = {};
			if (r.startOffset > 0) {
				if (r.start.nodeValue.length > r.startOffset) {
					nr.start = r.start.splitText(r.startOffset)
				} else {
					nr.start = r.start.nextSibling
				}
			} else {
				nr.start = r.start
			}
			if (r.start === r.end) {
				if (nr.start.nodeValue.length > r.endOffset - r.startOffset) {
					nr.start.splitText(r.endOffset - r.startOffset)
				}
				nr.end = nr.start
			} else {
				if (r.end.nodeValue.length > r.endOffset) {
					r.end.splitText(r.endOffset)
				}
				nr.end = r.end
			}
			nr.commonAncestor = this.commonAncestorContainer;
			while (nr.commonAncestor.nodeType !== Node.ELEMENT_NODE) {
				nr.commonAncestor = nr.commonAncestor.parentNode
			}
			return new Range.NormalizedRange(nr)
		};
		BrowserRange.prototype.serialize = function(root, ignoreSelector) {
			return this.normalize(root).serialize(root, ignoreSelector)
		};
		return BrowserRange
	} ();
	Range.NormalizedRange = function() {
		function NormalizedRange(obj) {
			this.commonAncestor = obj.commonAncestor;
			this.start = obj.start;
			this.end = obj.end
		}
		NormalizedRange.prototype.normalize = function(root) {
			return this
		};
		NormalizedRange.prototype.limit = function(bounds) {
			var nodes,
			parent,
			startParents,
			_k,
			_len2,
			_ref1;
			nodes = $.grep(this.textNodes(), 
			function(node) {
				return node.parentNode === bounds || $.contains(bounds, node.parentNode)
			});
			if (!nodes.length) {
				return null
			}
			this.start = nodes[0];
			this.end = nodes[nodes.length - 1];
			startParents = $(this.start).parents();
			_ref1 = $(this.end).parents();
			for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
				parent = _ref1[_k];
				if (startParents.index(parent) !== -1) {
					this.commonAncestor = parent;
					break
				}
			}
			return this
		};
		NormalizedRange.prototype.serialize = function(root, ignoreSelector) {
			var end,
			serialization,
			start;
			serialization = function(node, isEnd) {
				var n,
				nodes,
				offset,
				origParent,
				textNodes,
				xpath,
				_k,
				_len2;
				if (ignoreSelector) {
					origParent = $(node).parents(":not(" + ignoreSelector + ")").eq(0)
				} else {
					origParent = $(node).parent()
				}
				xpath = Util.xpathFromNode(origParent, root)[0];
				textNodes = Util.getTextNodes(origParent);
				nodes = textNodes.slice(0, textNodes.index(node));
				offset = 0;
				for (_k = 0, _len2 = nodes.length; _k < _len2; _k++) {
					n = nodes[_k];
					offset += n.nodeValue.length
				}
				if (isEnd) {
					return [xpath, offset + node.nodeValue.length]
				} else {
					return [xpath, offset]
				}
			};
			start = serialization(this.start);
			end = serialization(this.end, true);
			return new Range.SerializedRange({
				start: start[0],
				end: end[0],
				startOffset: start[1],
				endOffset: end[1]
			})
		};
		NormalizedRange.prototype.text = function() {
			var node;
			return function() {
				var _k,
				_len2,
				_ref1,
				_results;
				_ref1 = this.textNodes();
				_results = [];
				for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
					node = _ref1[_k];
					_results.push(node.nodeValue)
				}
				return _results
			}.call(this).join("")
		};
		NormalizedRange.prototype.textNodes = function() {
			var end,
			start,
			textNodes,
			_ref1;
			textNodes = Util.getTextNodes($(this.commonAncestor));
			_ref1 = [textNodes.index(this.start), textNodes.index(this.end)],
			start = _ref1[0],
			end = _ref1[1];
			return $.makeArray(textNodes.slice(start, +end + 1 || 9e9))
		};
		NormalizedRange.prototype.toRange = function() {
			var range;
			range = document.createRange();
			range.setStartBefore(this.start);
			range.setEndAfter(this.end);
			return range
		};
		return NormalizedRange
	} ();
	Range.SerializedRange = function() {
		function SerializedRange(obj) {
			this.start = obj.start;
			this.startOffset = obj.startOffset;
			this.end = obj.end;
			this.endOffset = obj.endOffset
		}
		SerializedRange.prototype.normalize = function(root) {
			var contains,
			e,
			length,
			node,
			p,
			range,
			targetOffset,
			tn,
			_k,
			_l,
			_len2,
			_len3,
			_ref1,
			_ref2;
			range = {};
			_ref1 = ["start", "end"];
			for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
				p = _ref1[_k];
				try {
					node = Range.nodeFromXPath(this[p], root)
				} catch(_error) {
					e = _error;
					throw new Range.RangeError(p, "Error while finding " + p + " node: " + this[p] + ": " + e, e)
				}
				if (!node) {
					throw new Range.RangeError(p, "Couldn't find " + p + " node: " + this[p])
				}
				length = 0;
				targetOffset = this[p + "Offset"];
				if (p === "end") {
					targetOffset--
				}
				_ref2 = Util.getTextNodes($(node));
				for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
					tn = _ref2[_l];
					if (length + tn.nodeValue.length > targetOffset) {
						range[p + "Container"] = tn;
						range[p + "Offset"] = this[p + "Offset"] - length;
						break
					} else {
						length += tn.nodeValue.length
					}
				}
				if (range[p + "Offset"] == null) {
					throw new Range.RangeError("" + p + "offset", "Couldn't find offset " + this[p + "Offset"] + " in element " + this[p])
				}
			}
			contains = document.compareDocumentPosition == null ? 
			function(a, b) {
				return a.contains(b)
			}: function(a, b) {
				return a.compareDocumentPosition(b) & 16
			};
			$(range.startContainer).parents().each(function() {
				if (contains(this, range.endContainer)) {
					range.commonAncestorContainer = this;
					return false
				}
			});
			return new Range.BrowserRange(range).normalize(root)
		};
		SerializedRange.prototype.serialize = function(root, ignoreSelector) {
			return this.normalize(root).serialize(root, ignoreSelector)
		};
		SerializedRange.prototype.toObject = function() {
			return {
				start: this.start,
				startOffset: this.startOffset,
				end: this.end,
				endOffset: this.endOffset
			}
		};
		return SerializedRange
	} ();
	_Annotator = this.Annotator;
	Annotator = function(_super) {
		__extends(Annotator, _super);
		Annotator.prototype.events = {
			".annotator-adder button click": "onAdderClick",
			".annotator-adder button mousedown": "onAdderMousedown",
			".annotator-hl click": "onHighlightClick",
			//".annotator-hl mouseout": "startViewerHideTimer"
		};
		Annotator.prototype.html = {
			adder: '<div class="annotator-adder"><button>' + _t("Annotate") + "</button></div>",
			wrapper: '<div class="annotator-wrapper"></div>'
		};
		Annotator.prototype.options = {
			readOnly: false
		};
		Annotator.prototype.plugins = {};
		Annotator.prototype.editor = null;
		Annotator.prototype.viewer = null;
		Annotator.prototype.selectedRanges = null;
		Annotator.prototype.mouseIsDown = false;
		Annotator.prototype.ignoreMouseup = false;
		Annotator.prototype.viewerHideTimer = null;
		function Annotator(element, options) {
			this.onDeleteAnnotation = __bind(this.onDeleteAnnotation, this);
			this.onEditAnnotation = __bind(this.onEditAnnotation, this);
			this.onAdderClick = __bind(this.onAdderClick, this);
			this.onAdderMousedown = __bind(this.onAdderMousedown, this);
			this.onHighlightClick = __bind(this.onHighlightClick, this);
			this.checkForEndSelection = __bind(this.checkForEndSelection, this);
			this.checkForStartSelection = __bind(this.checkForStartSelection, this);
			this.clearViewerHideTimer = __bind(this.clearViewerHideTimer, this);
			this.startViewerHideTimer = __bind(this.startViewerHideTimer, this);
			this.showViewer = __bind(this.showViewer, this);
			this.onEditorSubmit = __bind(this.onEditorSubmit, this);
			this.onEditorHide = __bind(this.onEditorHide, this);
			this.showEditor = __bind(this.showEditor, this);
			Annotator.__super__.constructor.apply(this, arguments);
			this.plugins = {};
			if (!Annotator.supported()) {
				return this
			}
			if (!this.options.readOnly) {
				this._setupDocumentEvents()
			}
			this._setupWrapper()._setupViewer()._setupEditor();
			this._setupDynamicStyle();
			this.adder = $(this.html.adder).appendTo(this.wrapper).hide();
			Annotator._instances.push(this)
		}
		Annotator.prototype._setupWrapper = function() {
			this.wrapper = $(this.html.wrapper);
			this.element.find("script").remove();
			this.element.wrapInner(this.wrapper);
			this.wrapper = this.element.find(".annotator-wrapper");
			return this
		};
		Annotator.prototype._setupViewer = function() {
			this.viewer = new Annotator.Viewer({
				readOnly: this.options.readOnly
			});
			this.viewer.hide().on("edit", this.onEditAnnotation).on("delete", this.onDeleteAnnotation).addField({
				load: function(_this) {
					return function(field, annotation) {
						if (annotation.text) {
							$(field).html(Util.escape(annotation.text))
						} else {
							$(field).html("<i>" + _t("No Comment") + "</i>")
						}
						return _this.publish("annotationViewerTextField", [field, annotation])
					}
				} (this)
			}).element.appendTo(this.wrapper).bind({
				//mouseover: this.clearViewerHideTimer,
				//mouseout: this.startViewerHideTimer
			});
			return this
		};
		Annotator.prototype._setupEditor = function() {
			this.editor = new Annotator.Editor;
			this.editor.hide().on("hide", this.onEditorHide).on("save", this.onEditorSubmit).addField({
				type: "textarea",
				label: _t("Comments") + "…",
				load: function(field, annotation) {
					return $(field).find("textarea").val(annotation.text || "")
				},
				submit: function(field, annotation) {
					return annotation.text = $(field).find("textarea").val()
				}
			});
			this.editor.element.appendTo(this.wrapper);
			return this
		};
		Annotator.prototype._setupDocumentEvents = function() {
			$(document).bind({
				mouseup: this.checkForEndSelection,
				click: this.checkForStartSelection
			});
			return this
		};
		Annotator.prototype._setupDynamicStyle = function() {
			var max,
			sel,
			style,
			x;
			style = $("#annotator-dynamic-style");
			if (!style.length) {
				style = $('<style id="annotator-dynamic-style"></style>').appendTo(document.head)
			}
			sel = "*" + 
			function() {
				var _k,
				_len2,
				_ref1,
				_results;
				_ref1 = ["adder", "outer", "notice", "filter"];
				_results = [];
				for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
					x = _ref1[_k];
					_results.push(":not(.annotator-" + x + ")")
				}
				return _results
			} ().join("");
			max = Util.maxZIndex($(document.body).find(sel));
			max = Math.max(max, 1e3);
			style.text([".annotator-adder, .annotator-outer, .annotator-notice {", "  z-index: " + (max + 20) + ";", "}", ".annotator-filter {", "  z-index: " + (max + 10) + ";", "}"].join("\n"));
			return this
		};
		Annotator.prototype.destroy = function() {
			var idx,
			name,
			plugin,
			_ref1;
			$(document).unbind({
				//mouseup: this.checkForEndSelection,
				click: this.checkForStartSelection
			});
			$("#annotator-dynamic-style").remove();
			this.adder.remove();
			this.viewer.destroy();
			this.editor.destroy();
			this.wrapper.find(".annotator-hl").each(function() {
				$(this).contents().insertBefore(this);
				return $(this).remove()
			});
			this.wrapper.contents().insertBefore(this.wrapper);
			this.wrapper.remove();
			this.element.data("annotator", null);
			_ref1 = this.plugins;
			for (name in _ref1) {
				plugin = _ref1[name];
				this.plugins[name].destroy()
			}
			this.removeEvents();
			idx = Annotator._instances.indexOf(this);
			if (idx !== -1) {
				return Annotator._instances.splice(idx, 1)
			}
		};
		Annotator.prototype.getSelectedRanges = function() {
			var browserRange,
			i,
			normedRange,
			r,
			ranges,
			rangesToIgnore,
			selection,
			_k,
			_len2;
			selection = Util.getGlobal().getSelection();
			ranges = [];
			rangesToIgnore = [];
			if (!selection.isCollapsed) {
				ranges = function() {
					var _k,
					_ref1,
					_results;
					_results = [];
					for (i = _k = 0, _ref1 = selection.rangeCount; 0 <= _ref1 ? _k < _ref1: _k > _ref1; i = 0 <= _ref1 ? ++_k: --_k) {
						r = selection.getRangeAt(i);
						browserRange = new Range.BrowserRange(r);
						normedRange = browserRange.normalize().limit(this.wrapper[0]);
						if (normedRange === null) {
							rangesToIgnore.push(r)
						}
						_results.push(normedRange)
					}
					return _results
				}.call(this);
				selection.removeAllRanges()
			}
			for (_k = 0, _len2 = rangesToIgnore.length; _k < _len2; _k++) {
				r = rangesToIgnore[_k];
				selection.addRange(r)
			}
			return $.grep(ranges, 
			function(range) {
				if (range) {
					selection.addRange(range.toRange())
				}
				return range
			})
		};
		Annotator.prototype.createAnnotation = function() {
			var annotation;
			annotation = {};
			this.publish("beforeAnnotationCreated", [annotation]);
			return annotation
		};
		Annotator.prototype.setupAnnotation = function(annotation) {
			var e,
			normed,
			normedRanges,
			r,
			root,
			_k,
			_l,
			_len2,
			_len3,
			_ref1;
			root = this.wrapper[0];
			annotation.ranges || (annotation.ranges = this.selectedRanges);
			normedRanges = [];
			_ref1 = annotation.ranges;
			for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
				r = _ref1[_k];
				try {
					normedRanges.push(Range.sniff(r).normalize(root))
				} catch(_error) {
					e = _error;
					if (e instanceof Range.RangeError) {
						this.publish("rangeNormalizeFail", [annotation, r, e])
					} else {
						throw e
					}
				}
			}
			annotation.quote = [];
			annotation.ranges = [];
			annotation.highlights = [];
			for (_l = 0, _len3 = normedRanges.length; _l < _len3; _l++) {
				normed = normedRanges[_l];
				annotation.quote.push($.trim(normed.text()));
				annotation.ranges.push(normed.serialize(this.wrapper[0], ".annotator-hl"));
				$.merge(annotation.highlights, this.highlightRange(normed))
			}
			annotation.quote = annotation.quote.join(" / ");
			$(annotation.highlights).data("annotation", annotation);
			$(annotation.highlights).attr("data-annotation-id", annotation.id);
			return annotation
		};
		Annotator.prototype.updateAnnotation = function(annotation) {
			this.publish("beforeAnnotationUpdated", [annotation]);
			$(annotation.highlights).attr("data-annotation-id", annotation.id);
			this.publish("annotationUpdated", [annotation]);
			return annotation
		};
		Annotator.prototype.deleteAnnotation = function(annotation) {
			var child,
			h,
			_k,
			_len2,
			_ref1;
			if (annotation.highlights != null) {
				_ref1 = annotation.highlights;
				for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
					h = _ref1[_k];
					if (! (h.parentNode != null)) {
						continue
					}
					child = h.childNodes[0];
					$(h).replaceWith(h.childNodes)
				}
			}
			this.publish("annotationDeleted", [annotation]);
			return annotation
		};
		Annotator.prototype.loadAnnotations = function(annotations) {
			var clone,
			loader;
			if (annotations == null) {
				annotations = []
			}
			loader = function(_this) {
				return function(annList) {
					var n,
					now,
					_k,
					_len2;
					if (annList == null) {
						annList = []
					}
					now = annList.splice(0, 10);
					for (_k = 0, _len2 = now.length; _k < _len2; _k++) {
						n = now[_k];
						_this.setupAnnotation(n)
					}
					if (annList.length > 0) {
						return setTimeout(function() {
							return loader(annList)
						},
						10)
					} else {
						return _this.publish("annotationsLoaded", [clone])
					}
				}
			} (this);
			clone = annotations.slice();
			loader(annotations);
			return this
		};
		Annotator.prototype.dumpAnnotations = function() {
			if (this.plugins["Store"]) {
				return this.plugins["Store"].dumpAnnotations()
			} else {
				console.warn(_t("Can't dump annotations without Store plugin."));
				return false
			}
		};
		Annotator.prototype.highlightRange = function(normedRange, cssClass) {
			var hl,
			node,
			white,
			_k,
			_len2,
			_ref1,
			_results;
			if (cssClass == null) {
				cssClass = "annotator-hl"
			}
			white = /^\s*$/;
			hl = $("<span class='" + cssClass + "' href=''></span>");
			_ref1 = normedRange.textNodes();
			_results = [];
			for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
				node = _ref1[_k];
				if (!white.test(node.nodeValue)) {
					_results.push($(node).wrapAll(hl).parent().show()[0])
				}
			}
			return _results
		};
		Annotator.prototype.highlightRanges = function(normedRanges, cssClass) {
			var highlights,
			r,
			_k,
			_len2;
			if (cssClass == null) {
				cssClass = "annotator-hl"
			}
			highlights = [];
			for (_k = 0, _len2 = normedRanges.length; _k < _len2; _k++) {
				r = normedRanges[_k];
				$.merge(highlights, this.highlightRange(r, cssClass))
			}
			return highlights
		};
		Annotator.prototype.addPlugin = function(name, options) {
			var klass,
			_base;
			if (this.plugins[name]) {
				console.error(_t("You cannot have more than one instance of any plugin."))
			} else {
				klass = Annotator.Plugin[name];
				if (typeof klass === "function") {
					this.plugins[name] = new klass(this.element[0], options);
					this.plugins[name].annotator = this;
					if (typeof(_base = this.plugins[name]).pluginInit === "function") {
						_base.pluginInit()
					}
				} else {
					console.error(_t("Could not load ") + name + _t(" plugin. Have you included the appropriate <script> tag?"))
				}
			}
			return this
		};
		Annotator.prototype.showEditor = function(annotation, location) {
			this.editor.element.css(location);
			this.editor.load(annotation);
			this.publish("annotationEditorShown", [this.editor, annotation]);
			return this
		};
		Annotator.prototype.onEditorHide = function() {
			this.publish("annotationEditorHidden", [this.editor]);
			return this.ignoreMouseup = false
		};
		Annotator.prototype.onEditorSubmit = function(annotation) {
			return this.publish("annotationEditorSubmit", [this.editor, annotation])
		};
		Annotator.prototype.showViewer = function(annotations, location) {
			this.viewer.element.css(location);
			this.viewer.load(annotations);
			return this.publish("annotationViewerShown", [this.viewer, annotations])
		};
		Annotator.prototype.startViewerHideTimer = function() {
			if (!this.viewerHideTimer) {
				return this.viewerHideTimer = setTimeout(this.viewer.hide, 250) // Amanda: change timer length if annotation happens across in sidebar; was originally 250
			}
		};
		Annotator.prototype.clearViewerHideTimer = function() {
			clearTimeout(this.viewerHideTimer);
			return this.viewerHideTimer = false
		};
		Annotator.prototype.checkForStartSelection = function(event) {
			if (! (event && this.isAnnotator(event.target))) {
				this.startViewerHideTimer()
			}
			return this.mouseIsDown = true
		};
		Annotator.prototype.checkForEndSelection = function(event) {
			var container,
			range,
			_k,
			_len2,
			_ref1;
			this.mouseIsDown = false;
			if (this.ignoreMouseup) {
				return
			}
			this.selectedRanges = this.getSelectedRanges();
			_ref1 = this.selectedRanges;
			for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
				range = _ref1[_k];
				container = range.commonAncestor;
				if ($(container).hasClass("annotator-hl")) {
					container = $(container).parents("[class!=annotator-hl]")[0]
				}
				if (this.isAnnotator(container)) {
					return
				}
			}
			if (event && this.selectedRanges.length) {
				return this.adder.css(Util.mousePosition(event, this.wrapper[0])).show()
			} else {
				return this.adder.hide()
			}
		};
		Annotator.prototype.isAnnotator = function(element) {
			return !! $(element).parents().addBack().filter("[class^=annotator-]").not(this.wrapper).length
		};
		Annotator.prototype.onHighlightClick = function(event) {
			var annotations;
			/*this.clearViewerHideTimer(); //Amanda: removed to change highlight activation from hover to click
			if (this.mouseIsDown || this.viewer.isShown()) {
				return false
			}*/
			annotations = $(event.target).parents(".annotator-hl").addBack().map(function() {
				return $(this).data("annotation")
			});
			return this.showViewer($.makeArray(annotations), Util.mousePosition(event, this.wrapper[0]))
		};
		Annotator.prototype.onAdderMousedown = function(event) {
			if (event != null) {
				event.preventDefault()
			}
			return this.ignoreMouseup = true
		};
		Annotator.prototype.onAdderClick = function(event) {
			var annotation,
			cancel,
			cleanup,
			position,
			save;
			if (event != null) {
				event.preventDefault()
			}
			position = this.adder.position();
			this.adder.hide();
			annotation = this.setupAnnotation(this.createAnnotation());
			$(annotation.highlights).addClass("annotator-hl-temporary");
			save = function(_this) {
				return function() {
					cleanup();
					$(annotation.highlights).removeClass("annotator-hl-temporary");
					return _this.publish("annotationCreated", [annotation])
				}
			} (this);
			cancel = function(_this) {
				return function() {
					cleanup();
					return _this.deleteAnnotation(annotation)
				}
			} (this);
			cleanup = function(_this) {
				return function() {
					_this.unsubscribe("annotationEditorHidden", cancel);
					return _this.unsubscribe("annotationEditorSubmit", save)
				}
			} (this);
			this.subscribe("annotationEditorHidden", cancel);
			this.subscribe("annotationEditorSubmit", save);
			return this.showEditor(annotation, position)
		};
		Annotator.prototype.onEditAnnotation = function(annotation) {
			var cleanup,
			offset,
			update;
			offset = this.viewer.element.position();
			update = function(_this) {
				return function() {
					cleanup();
					return _this.updateAnnotation(annotation)
				}
			} (this);
			cleanup = function(_this) {
				return function() {
					_this.unsubscribe("annotationEditorHidden", cleanup);
					return _this.unsubscribe("annotationEditorSubmit", update)
				}
			} (this);
			this.subscribe("annotationEditorHidden", cleanup);
			this.subscribe("annotationEditorSubmit", update);
			this.viewer.hide();
			return this.showEditor(annotation, offset)
		};
		Annotator.prototype.onDeleteAnnotation = function(annotation) {
			this.viewer.hide();
			return this.deleteAnnotation(annotation)
		};
		return Annotator
	} (Delegator);
	Annotator.Plugin = function(_super) {
		__extends(Plugin, _super);
		function Plugin(element, options) {
			Plugin.__super__.constructor.apply(this, arguments)
		}
		Plugin.prototype.pluginInit = function() {};
		Plugin.prototype.destroy = function() {
			return this.removeEvents()
		};
		return Plugin
	} (Delegator);
	g = Util.getGlobal();
	if (((_ref1 = g.document) != null ? _ref1.evaluate: void 0) == null) {
		$.getScript("http://assets.annotateit.org/vendor/xpath.min.js")
	}
	if (g.getSelection == null) {
		$.getScript("http://assets.annotateit.org/vendor/ierange.min.js")
	}
	if (g.JSON == null) {
		$.getScript("http://assets.annotateit.org/vendor/json2.min.js")
	}
	if (g.Node == null) {
		g.Node = {
			ELEMENT_NODE: 1,
			ATTRIBUTE_NODE: 2,
			TEXT_NODE: 3,
			CDATA_SECTION_NODE: 4,
			ENTITY_REFERENCE_NODE: 5,
			ENTITY_NODE: 6,
			PROCESSING_INSTRUCTION_NODE: 7,
			COMMENT_NODE: 8,
			DOCUMENT_NODE: 9,
			DOCUMENT_TYPE_NODE: 10,
			DOCUMENT_FRAGMENT_NODE: 11,
			NOTATION_NODE: 12
		}
	}
	Annotator.$ = $;
	Annotator.Delegator = Delegator;
	Annotator.Range = Range;
	Annotator.Util = Util;
	Annotator._instances = [];
	Annotator._t = _t;
	Annotator.supported = function() {
		return function() {
			return !! this.getSelection
		} ()
	};
	Annotator.noConflict = function() {
		Util.getGlobal().Annotator = _Annotator;
		return this
	};
	$.fn.annotator = function(options) {
		var args;
		args = Array.prototype.slice.call(arguments, 1);
		return this.each(function() {
			var instance;
			instance = $.data(this, "annotator");
			if (instance) {
				return options && instance[options].apply(instance, args)
				
			} else {
				instance = new Annotator(this, options);
				return $.data(this, "annotator", instance)
			}
		})
	};
	this.Annotator = Annotator;
	Annotator.Widget = function(_super) {
		__extends(Widget, _super);
		Widget.prototype.classes = {
			hide: "annotator-hide",
			invert: {
				x: "annotator-invert-x",
				y: "annotator-invert-y"
			}
		};
		function Widget(element, options) {
			Widget.__super__.constructor.apply(this, arguments);
			this.classes = $.extend({},
			Annotator.Widget.prototype.classes, this.classes)
		}
		Widget.prototype.destroy = function() {
			this.removeEvents();
			return this.element.remove()
		};
		Widget.prototype.checkOrientation = function() {
			var current,
			offset,
			viewport,
			widget,
			window;
			this.resetOrientation();
			window = $(Annotator.Util.getGlobal());
			widget = this.element.children(":first");
			offset = widget.offset();
			viewport = {
				top: window.scrollTop(),
				right: window.width() + window.scrollLeft()
			};
			current = {
				top: offset.top,
				right: offset.left + widget.width()
			};
			if (current.top - viewport.top < 0) {
				this.invertY()
			}
			if (current.right - viewport.right > 0) {
				this.invertX()
			}
			return this
		};
		Widget.prototype.resetOrientation = function() {
			this.element.removeClass(this.classes.invert.x).removeClass(this.classes.invert.y);
			return this
		};
		Widget.prototype.invertX = function() {
			this.element.addClass(this.classes.invert.x);
			return this
		};
		Widget.prototype.invertY = function() {
			this.element.addClass(this.classes.invert.y);
			return this
		};
		Widget.prototype.isInvertedY = function() {
			return this.element.hasClass(this.classes.invert.y)
		};
		Widget.prototype.isInvertedX = function() {
			return this.element.hasClass(this.classes.invert.x)
		};
		return Widget
	} (Delegator);
	Annotator.Editor = function(_super) {
		__extends(Editor, _super);
		Editor.prototype.events = {
			"form submit": "submit",
			".annotator-save click": "submit",
			".annotator-cancel click": "hide",
			".annotator-cancel mouseover": "onCancelButtonMouseover",
			"textarea keydown": "processKeypress"
		};
		Editor.prototype.classes = {
			hide: "annotator-hide",
			focus: "annotator-focus"
		};
		Editor.prototype.html = '<div class="annotator-outer annotator-editor">\n  <form class="annotator-widget">\n    <ul class="annotator-listing"></ul>\n    <div class="annotator-controls">\n      <a href="#cancel" class="annotator-cancel">' + _t("Cancel") + '</a>\n<a href="#save" class="annotator-save annotator-focus">' + _t("Save") + "</a>\n    </div>\n  </form>\n</div>";
		Editor.prototype.options = {};
		function Editor(options) {
			this.onCancelButtonMouseover = __bind(this.onCancelButtonMouseover, this);
			this.processKeypress = __bind(this.processKeypress, this);
			this.submit = __bind(this.submit, this);
			this.load = __bind(this.load, this);
			this.hide = __bind(this.hide, this);
			this.show = __bind(this.show, this);
			Editor.__super__.constructor.call(this, $(this.html)[0], options);
			this.fields = [];
			this.annotation = {}
		}
		Editor.prototype.show = function(event) {
			Annotator.Util.preventEventDefault(event);
			this.element.removeClass(this.classes.hide);
			this.element.find(".annotator-save").addClass(this.classes.focus);
			this.checkOrientation();
			this.element.find(":input:first").focus();
			this.setupDraggables();
			return this.publish("show")
		};
		Editor.prototype.hide = function(event) {
			Annotator.Util.preventEventDefault(event);
			this.element.addClass(this.classes.hide);
			return this.publish("hide")
		};
		Editor.prototype.load = function(annotation) {
			var field,
			_k,
			_len2,
			_ref2;
			this.annotation = annotation;
			this.publish("load", [this.annotation]);
			_ref2 = this.fields;
			for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
				field = _ref2[_k];
				field.load(field.element, this.annotation)
			}
			return this.show()
		};
		Editor.prototype.submit = function(event) {
			var field,
			_k,
			_len2,
			_ref2;
			Annotator.Util.preventEventDefault(event);
			_ref2 = this.fields;
			for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
				field = _ref2[_k];
				field.submit(field.element, this.annotation)
			}
			this.publish("save", [this.annotation]);
			return this.hide()
		};
		Editor.prototype.addField = function(options) {
			var element,
			field,
			input;
			field = $.extend({
				id: "annotator-field-" + Annotator.Util.uuid(),
				type: "input",
				label: "",
				load: function() {},
				submit: function() {}
			},
			options);
			input = null;
			element = $('<li class="annotator-item" />');
			field.element = element[0];
			switch (field.type) {
			case "textarea":
				input = $("<textarea />");
				break;
			case "input":
			case "checkbox":
				input = $("<input />");
				break;
			case "select":
				input = $("<select />")
			}
			element.append(input);
			input.attr({
				id: field.id,
				placeholder: field.label
			});
			if (field.type === "checkbox") {
				input[0].type = "checkbox";
				element.addClass("annotator-checkbox");
				element.append($("<label />", {
					"for": field.id,
					html: field.label
				}))
			}
			this.element.find("ul:first").append(element);
			this.fields.push(field);
			return field.element
		};
		Editor.prototype.checkOrientation = function() {
			var controls,
			list;
			Editor.__super__.checkOrientation.apply(this, arguments);
			list = this.element.find("ul");
			controls = this.element.find(".annotator-controls");
			if (this.element.hasClass(this.classes.invert.y)) {
				controls.insertBefore(list)
			} else if (controls.is(":first-child")) {
				controls.insertAfter(list)
			}
			return this
		};
		Editor.prototype.processKeypress = function(event) {
			if (event.keyCode === 27) {
				return this.hide()
			} else if (event.keyCode === 13 && !event.shiftKey) {
				return this.submit()
			}
		};
		Editor.prototype.onCancelButtonMouseover = function() {
			return this.element.find("." + this.classes.focus).removeClass(this.classes.focus)
		};
		Editor.prototype.setupDraggables = function() {
			var classes,
			controls,
			cornerItem,
			editor,
			mousedown,
			onMousedown,
			onMousemove,
			onMouseup,
			resize,
			textarea,
			throttle;
			this.element.find(".annotator-resize").remove();
			if (this.element.hasClass(this.classes.invert.y)) {
				cornerItem = this.element.find(".annotator-item:last")
			} else {
				cornerItem = this.element.find(".annotator-item:first")
			}
			if (cornerItem) {
				$('<span class="annotator-resize"></span>').appendTo(cornerItem)
			}
			mousedown = null;
			classes = this.classes;
			editor = this.element;
			textarea = null;
			resize = editor.find(".annotator-resize");
			controls = editor.find(".annotator-controls");
			throttle = false;
			onMousedown = function(event) {
				if (event.target === this) {
					mousedown = {
						element: this,
						top: event.pageY,
						left: event.pageX
					};
					textarea = editor.find("textarea:first");
					$(window).bind({
						"mouseup.annotator-editor-resize": onMouseup,
						"mousemove.annotator-editor-resize": onMousemove
					});
					return event.preventDefault()
				}
			};
			onMouseup = function() {
				mousedown = null;
				return $(window).unbind(".annotator-editor-resize")
			};
			onMousemove = function(_this) {
				return function(event) {
					var diff,
					directionX,
					directionY,
					height,
					width;
					if (mousedown && throttle === false) {
						diff = {
							top: event.pageY - mousedown.top,
							left: event.pageX - mousedown.left
						};
						if (mousedown.element === resize[0]) {
							height = textarea.outerHeight();
							width = textarea.outerWidth();
							directionX = editor.hasClass(classes.invert.x) ? -1: 1;
							directionY = editor.hasClass(classes.invert.y) ? 1: -1;
							textarea.height(height + diff.top * directionY);
							textarea.width(width + diff.left * directionX);
							if (textarea.outerHeight() !== height) {
								mousedown.top = event.pageY
							}
							if (textarea.outerWidth() !== width) {
								mousedown.left = event.pageX
							}
						} else if (mousedown.element === controls[0]) {
							editor.css({
								top: parseInt(editor.css("top"), 10) + diff.top,
								left: parseInt(editor.css("left"), 10) + diff.left
							});
							mousedown.top = event.pageY;
							mousedown.left = event.pageX
						}
						throttle = true;
						return setTimeout(function() {
							return throttle = false
						},
						1e3 / 60)
					}
				}
			} (this);
			resize.bind("mousedown", onMousedown);
			return controls.bind("mousedown", onMousedown)
		};
		return Editor
	} (Annotator.Widget);
	Annotator.Viewer = function(_super) {
		__extends(Viewer, _super);
		Viewer.prototype.events = {
			".annotator-edit click": "onEditClick",
			".annotator-delete click": "onDeleteClick"
		};
		Viewer.prototype.classes = {
			hide: "annotator-hide",
			showControls: "annotator-visible"
		};
		Viewer.prototype.html = {
			element: '<div class="annotator-outer annotator-viewer">\n  <ul class="annotator-widget annotator-listing"></ul>\n</div>',
			item: '<li class="annotator-annotation annotator-item">\n <span class="annotator-controls">\n    <a href="#" title="View as webpage" class="annotator-link">View as webpage</a>\n    <button title="Edit" class="annotator-edit">Edit</button>\n    <button title="Delete" class="annotator-delete">Delete</button>\n  </span>\n</li>'
		};
		Viewer.prototype.options = {
			readOnly: false
		};
		function Viewer(options) {
			this.onDeleteClick = __bind(this.onDeleteClick, this);
			this.onEditClick = __bind(this.onEditClick, this);
			this.load = __bind(this.load, this);
			this.hide = __bind(this.hide, this);
			this.show = __bind(this.show, this);
			Viewer.__super__.constructor.call(this, $(this.html.element)[0], options);
			this.item = $(this.html.item)[0];
			this.fields = [];
			this.annotations = []
		}
		Viewer.prototype.show = function(event) {
			var controls;
			Annotator.Util.preventEventDefault(event);
			controls = this.element.find(".annotator-controls").addClass(this.classes.showControls);
			setTimeout(function(_this) {
				return function() {
					return controls.removeClass(_this.classes.showControls)
				}
			} (this), 500);
			this.element.removeClass(this.classes.hide);
			return this.checkOrientation().publish("show")
		};
		Viewer.prototype.isShown = function() {
			return ! this.element.hasClass(this.classes.hide)
		};
		Viewer.prototype.hide = function(event) {
			Annotator.Util.preventEventDefault(event);
			this.element.addClass(this.classes.hide);
			return this.publish("hide")
		};
		Viewer.prototype.load = function(annotations) {
			var annotation,
			controller,
			controls,
			del,
			edit,
			element,
			field,
			item,
			link,
			links,
			list,
			_k,
			_l,
			_len2,
			_len3,
			_ref2,
			_ref3;
			this.annotations = annotations || []; //Amanda: Begin code to input annotations NIDs related to a highlight to concealed view exposed filter for annosidebar view.
			var theresult = new Array();
			for(var key in annotations){
  				allNIDs = annotations[key]['nid'];
  				theresult.push(allNIDs);
			}
			grabNID = theresult.join(',');
			$('#edit-nid--2').val(grabNID);
			$('#views-exposed-form-annosidebar-annosidebar').submit();//Amanda:  autosubmit; working code ends
			list = this.element.find("ul:first").empty();
			_ref2 = this.annotations;
			for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
				annotation = _ref2[_k];
				item = $(this.item).clone().appendTo(list).data("annotation", annotation);
				controls = item.find(".annotator-controls");
				link = controls.find(".annotator-link");
				edit = controls.find(".annotator-edit");
				del = controls.find(".annotator-delete");
				links = new LinkParser(annotation.links || []).get("alternate", {
					type: "text/html"
				});
				if (links.length === 0 || links[0].href == null) {
					link.remove()
				} else {
					link.attr("href", links[0].href);
				}
				if (this.options.readOnly) {
					edit.remove();
					del.remove()
				} else {
					controller = {
						showEdit: function() {
							return edit.removeAttr("disabled")
						},
						hideEdit: function() {
							return edit.attr("disabled", "disabled")
						},
						showDelete: function() {
							return del.removeAttr("disabled")
						},
						hideDelete: function() {
							return del.attr("disabled", "disabled")
						}
					}
				}
				_ref3 = this.fields;
				for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
					field = _ref3[_l];
					element = $(field.element).clone().appendTo(item)[0];
					field.load(element, annotation, controller)
				}
			}
			this.publish("load", [this.annotations]);
			return this.show()
		}; 
		Viewer.prototype.addField = function(options) {
			var field;
			field = $.extend({
				load: function() {}
			},
			options);
			field.element = $("<div />")[0];
			this.fields.push(field);
			field.element;
			return this
		};
		Viewer.prototype.onEditClick = function(event) {
			return this.onButtonClick(event, "edit")
		};
		Viewer.prototype.onDeleteClick = function(event) {
			return this.onButtonClick(event, "delete")
		};
		Viewer.prototype.onButtonClick = function(event, type) {
			var item;
			item = $(event.target).parents(".annotator-annotation");
			return this.publish(type, [item.data("annotation")])
		};
		return Viewer
	} (Annotator.Widget);
	LinkParser = function() {
		function LinkParser(data) {
			this.data = data
		}
		LinkParser.prototype.get = function(rel, cond) {
			var d,
			k,
			keys,
			match,
			v,
			_k,
			_len2,
			_ref2,
			_results;
			if (cond == null) {
				cond = {}
			}
			cond = $.extend({},
			cond, {
				rel: rel
			});
			keys = function() {
				var _results;
				_results = [];
				for (k in cond) {
					if (!__hasProp.call(cond, k)) continue;
					v = cond[k];
					_results.push(k)
				}
				return _results
			} ();
			_ref2 = this.data;
			_results = [];
			for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
				d = _ref2[_k];
				match = keys.reduce(function(m, k) {
					return m && d[k] === cond[k]
				},
				true);
				if (match) {
					_results.push(d)
				} else {
					continue
				}
			}
			return _results
		};
		return LinkParser
	} ();
	Annotator = Annotator || {};
	Annotator.Notification = function(_super) {
		__extends(Notification, _super);
		Notification.prototype.events = {
			click: "hide"
		};
		Notification.prototype.options = {
			html: "<div class='annotator-notice'></div>",
			classes: {
				show: "annotator-notice-show",
				info: "annotator-notice-info",
				success: "annotator-notice-success",
				error: "annotator-notice-error"
			}
		};
		function Notification(options) {
			this.hide = __bind(this.hide, this);
			this.show = __bind(this.show, this);
			Notification.__super__.constructor.call(this, $(this.options.html).appendTo(document.body)[0], options)
		}
		Notification.prototype.show = function(message, status) {
			if (status == null) {
				status = Annotator.Notification.INFO
			}
			this.currentStatus = status;
			$(this.element).addClass(this.options.classes.show).addClass(this.options.classes[this.currentStatus]).html(Util.escape(message || ""));
			setTimeout(this.hide, 5e3);
			return this
		};
		Notification.prototype.hide = function() {
			if (this.currentStatus == null) {
				this.currentStatus = Annotator.Notification.INFO
			}
			$(this.element).removeClass(this.options.classes.show).removeClass(this.options.classes[this.currentStatus]);
			return this
		};
		return Notification
	} (Delegator);
	Annotator.Notification.INFO = "info";
	Annotator.Notification.SUCCESS = "success";
	Annotator.Notification.ERROR = "error";
	$(function() {
		var notification;
		notification = new Annotator.Notification;
		Annotator.showNotification = notification.show;
		return Annotator.hideNotification = notification.hide
	});
	Annotator.Plugin.Unsupported = function(_super) {
		__extends(Unsupported, _super);
		function Unsupported() {
			return Unsupported.__super__.constructor.apply(this, arguments)
		}
		Unsupported.prototype.options = {
			message: Annotator._t("Annotation is not supported by this browser, and/or you need to enable Javascript in your browser to annotate.") // Amanda: clarified unsupported message. Note this message has a character limit (127 characters?).
		};
		Unsupported.prototype.pluginInit = function() {
			if (!Annotator.supported()) {
				return $(function(_this) {
					return function() {
						Annotator.showNotification(_this.options.message);
						if (window.XMLHttpRequest === void 0 && ActiveXObject !== void 0) {
							return $("html").addClass("ie6")
						}
					}
				} (this))
			}
		};
		return Unsupported
	} (Annotator.Plugin);
	createDateFromISO8601 = function(string) {
		var d,
		date,
		offset,
		regexp,
		time,
		_ref2;
		regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" + "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\\.([0-9]+))?)?" + "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
		d = string.match(new RegExp(regexp));
		offset = 0;
		date = new Date(d[1], 0, 1);
		if (d[3]) {
			date.setMonth(d[3] - 1)
		}
		if (d[5]) {
			date.setDate(d[5])
		}
		if (d[7]) {
			date.setHours(d[7])
		}
		if (d[8]) {
			date.setMinutes(d[8])
		}
		if (d[10]) {
			date.setSeconds(d[10])
		}
		if (d[12]) {
			date.setMilliseconds(Number("0." + d[12]) * 1e3)
		}
		if (d[14]) {
			offset = Number(d[16]) * 60 + Number(d[17]);
			offset *= (_ref2 = d[15] === "-") != null ? _ref2: {
				1: -1
			}
		}
		offset -= date.getTimezoneOffset();
		time = Number(date) + offset * 60 * 1e3;
		date.setTime(Number(time));
		return date
	};
	base64Decode = function(data) {
		var ac,
		b64,
		bits,
		dec,
		h1,
		h2,
		h3,
		h4,
		i,
		o1,
		o2,
		o3,
		tmp_arr;
		if (typeof atob !== "undefined" && atob !== null) {
			return atob(data)
		} else {
			b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
			i = 0;
			ac = 0;
			dec = "";
			tmp_arr = [];
			if (!data) {
				return data
			}
			data += "";
			while (i < data.length) {
				h1 = b64.indexOf(data.charAt(i++));
				h2 = b64.indexOf(data.charAt(i++));
				h3 = b64.indexOf(data.charAt(i++));
				h4 = b64.indexOf(data.charAt(i++));
				bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
				o1 = bits >> 16 & 255;
				o2 = bits >> 8 & 255;
				o3 = bits & 255;
				if (h3 === 64) {
					tmp_arr[ac++] = String.fromCharCode(o1)
				} else if (h4 === 64) {
					tmp_arr[ac++] = String.fromCharCode(o1, o2)
				} else {
					tmp_arr[ac++] = String.fromCharCode(o1, o2, o3)
				}
			}
			return tmp_arr.join("")
		}
	};
	base64UrlDecode = function(data) {
		var i,
		m,
		_k,
		_ref2;
		m = data.length % 4;
		if (m !== 0) {
			for (i = _k = 0, _ref2 = 4 - m; 0 <= _ref2 ? _k < _ref2: _k > _ref2; i = 0 <= _ref2 ? ++_k: --_k) {
				data += "="
			}
		}
		data = data.replace(/-/g, "+");
		data = data.replace(/_/g, "/");
		return base64Decode(data)
	};
	parseToken = function(token) {
		var head,
		payload,
		sig,
		_ref2;
		_ref2 = token.split("."),
		head = _ref2[0],
		payload = _ref2[1],
		sig = _ref2[2];
		return JSON.parse(base64UrlDecode(payload))
	};
	Annotator.Plugin.Auth = function(_super) {
		__extends(Auth, _super);
		Auth.prototype.options = {
			token: null,
			tokenUrl: "/auth/token",
			autoFetch: true
		};
		function Auth(element, options) {
			Auth.__super__.constructor.apply(this, arguments);
			this.waitingForToken = [];
			if (this.options.token) {
				this.setToken(this.options.token)
			} else {
				this.requestToken()
			}
		}
		Auth.prototype.requestToken = function() {
			this.requestInProgress = true;
			return $.ajax({
				url: this.options.tokenUrl,
				dataType: "text",
				xhrFields: {
					withCredentials: true
				}
			}).done(function(_this) {
				return function(data, status, xhr) {
					return _this.setToken(data)
				}
			} (this)).fail(function(_this) {
				return function(xhr, status, err) {
					var msg;
					msg = Annotator._t("Couldn't get auth token:");
					console.error("" + msg + " " + err, xhr);
					return Annotator.showNotification("" + msg + " " + xhr.responseText, Annotator.Notification.ERROR)
				}
			} (this)).always(function(_this) {
				return function() {
					return _this.requestInProgress = false
				}
			} (this))
		};
		Auth.prototype.setToken = function(token) {
			var _results;
			this.token = token;
			this._unsafeToken = parseToken(token);
			if (this.haveValidToken()) {
				if (this.options.autoFetch) {
					this.refreshTimeout = setTimeout(function(_this) {
						return function() {
							return _this.requestToken()
						}
					} (this), (this.timeToExpiry() - 2) * 1e3)
				}
				this.updateHeaders();
				_results = [];
				while (this.waitingForToken.length > 0) {
					_results.push(this.waitingForToken.pop()(this._unsafeToken))
				}
				return _results
			} else {
				console.warn(Annotator._t("Didn't get a valid token."));
				if (this.options.autoFetch) {
					console.warn(Annotator._t("Getting a new token in 10s."));
					return setTimeout(function(_this) {
						return function() {
							return _this.requestToken()
						}
					} (this), 10 * 1e3)
				}
			}
		};
		Auth.prototype.haveValidToken = function() {
			var allFields;
			allFields = this._unsafeToken && this._unsafeToken.issuedAt && this._unsafeToken.ttl && this._unsafeToken.consumerKey;
			if (allFields && this.timeToExpiry() > 0) {
				return true
			} else {
				return false
			}
		};
		Auth.prototype.timeToExpiry = function() {
			var expiry,
			issue,
			now,
			timeToExpiry;
			now = (new Date).getTime() / 1e3;
			issue = createDateFromISO8601(this._unsafeToken.issuedAt).getTime() / 1e3;
			expiry = issue + this._unsafeToken.ttl;
			timeToExpiry = expiry - now;
			if (timeToExpiry > 0) {
				return timeToExpiry
			} else {
				return 0
			}
		};
		Auth.prototype.updateHeaders = function() {
			var current;
			current = this.element.data("annotator:headers");
			return this.element.data("annotator:headers", $.extend(current, {
				"x-annotator-auth-token": this.token
			}))
		};
		Auth.prototype.withToken = function(callback) {
			if (callback == null) {
				return
			}
			if (this.haveValidToken()) {
				return callback(this._unsafeToken)
			} else {
				this.waitingForToken.push(callback);
				if (!this.requestInProgress) {
					return this.requestToken()
				}
			}
		};
		return Auth
	} (Annotator.Plugin);
	Annotator.Plugin.Store = function(_super) {
		__extends(Store, _super);
		Store.prototype.events = {
			annotationCreated: "annotationCreated",
			annotationDeleted: "annotationDeleted",
			annotationUpdated: "annotationUpdated"
		};
		Store.prototype.options = {
			annotationData: {},
			emulateHTTP: false,
			loadFromSearch: false,
			prefix: "/store",
			urls: {
				create: "/annotations",
				read: "/annotations/:id",
				update: "/annotations/:id",
				destroy: "/annotations/:id",
				search: "/search"
			}
		};
		function Store(element, options) {
			this._onError = __bind(this._onError, this);
			this._onLoadAnnotationsFromSearch = __bind(this._onLoadAnnotationsFromSearch, this);
			this._onLoadAnnotations = __bind(this._onLoadAnnotations, this);
			this._getAnnotations = __bind(this._getAnnotations, this);
			Store.__super__.constructor.apply(this, arguments);
			this.annotations = []
		}
		Store.prototype.pluginInit = function() {
			if (!Annotator.supported()) {
				return
			}
			if (this.annotator.plugins.Auth) {
				return this.annotator.plugins.Auth.withToken(this._getAnnotations)
			} else {
				return this._getAnnotations()
			}
		};
		Store.prototype._getAnnotations = function() {
			if (this.options.loadFromSearch) {
				return this.loadAnnotationsFromSearch(this.options.loadFromSearch)
			} else {
				return this.loadAnnotations()
			}
		};
		Store.prototype.annotationCreated = function(annotation) {
			if (__indexOf.call(this.annotations, annotation) < 0) {
				this.registerAnnotation(annotation);
				return this._apiRequest("create", annotation, 
				function(_this) {
					return function(data) {
						if (data.id == null) {
							console.warn(Annotator._t("Warning: No ID returned from server for annotation "), annotation)
						}
						return _this.updateAnnotation(annotation, data)
					}
				} (this))
			} else {
				return this.updateAnnotation(annotation, {})
			}
		};
		Store.prototype.annotationUpdated = function(annotation) {
			if (__indexOf.call(this.annotations, annotation) >= 0) {
				return this._apiRequest("update", annotation, 
				function(_this) {
					return function(data) {
						return _this.updateAnnotation(annotation, data)
					}
				} (this))
			}
		};
		Store.prototype.annotationDeleted = function(annotation) {
			if (__indexOf.call(this.annotations, annotation) >= 0) {
				return this._apiRequest("destroy", annotation, 
				function(_this) {
					return function() {
						return _this.unregisterAnnotation(annotation)
					}
				} (this))
			}
		};
		Store.prototype.registerAnnotation = function(annotation) {
			return this.annotations.push(annotation)
		};
		Store.prototype.unregisterAnnotation = function(annotation) {
			return this.annotations.splice(this.annotations.indexOf(annotation), 1)
		};
		Store.prototype.updateAnnotation = function(annotation, data) {
			if (__indexOf.call(this.annotations, annotation) < 0) {
				console.error(Annotator._t("Trying to update unregistered annotation!"))
			} else {
				$.extend(annotation, data)
			}
			return $(annotation.highlights).data("annotation", annotation)
		};
		Store.prototype.loadAnnotations = function() {
			return this._apiRequest("read", null, this._onLoadAnnotations)
		};
		Store.prototype._onLoadAnnotations = function(data) {
			var a,
			annotation,
			annotationMap,
			newData,
			_k,
			_l,
			_len2,
			_len3,
			_ref2;
			if (data == null) {
				data = []
			}
			annotationMap = {};
			_ref2 = this.annotations;
			for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
				a = _ref2[_k];
				annotationMap[a.id] = a
			}
			newData = [];
			for (_l = 0, _len3 = data.length; _l < _len3; _l++) {
				a = data[_l];
				if (annotationMap[a.id]) {
					annotation = annotationMap[a.id];
					this.updateAnnotation(annotation, a)
				} else {
					newData.push(a)
				}
			}
			this.annotations = this.annotations.concat(newData);
			return this.annotator.loadAnnotations(newData.slice())
		};
		Store.prototype.loadAnnotationsFromSearch = function(searchOptions) {
			return this._apiRequest("search", searchOptions, this._onLoadAnnotationsFromSearch)
		};
		Store.prototype._onLoadAnnotationsFromSearch = function(data) {
			if (data == null) {
				data = {}
			}
			return this._onLoadAnnotations(data.rows || [])
		};
		Store.prototype.dumpAnnotations = function() {
			var ann,
			_k,
			_len2,
			_ref2,
			_results;
			_ref2 = this.annotations;
			_results = [];
			for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
				ann = _ref2[_k];
				_results.push(JSON.parse(this._dataFor(ann)))
			}
			return _results
		};
		Store.prototype._apiRequest = function(action, obj, onSuccess) {
			var id,
			options,
			request,
			url;
			id = obj && obj.id;
			url = this._urlFor(action, id);
			options = this._apiRequestOptions(action, obj, onSuccess);
			request = $.ajax(url, options);
			request._id = id;
			request._action = action;
			return request
		};
		Store.prototype._apiRequestOptions = function(action, obj, onSuccess) {
			var data,
			method,
			opts;
			method = this._methodFor(action);
			opts = {
				type: method,
				headers: this.element.data("annotator:headers"),
				dataType: "json",
				success: onSuccess || 
				function() {},
				error: this._onError
			};
			if (this.options.emulateHTTP && (method === "PUT" || method === "DELETE")) {
				opts.headers = $.extend(opts.headers, {
					"X-HTTP-Method-Override": method
				});
				opts.type = "POST"
			}
			if (action === "search") {
				opts = $.extend(opts, {
					data: obj
				});
				return opts
			}
			data = obj && this._dataFor(obj);
			if (this.options.emulateJSON) {
				opts.data = {
					json: data
				};
				if (this.options.emulateHTTP) {
					opts.data._method = method
				}
				return opts
			}
			opts = $.extend(opts, {
				data: data,
				contentType: "application/json; charset=utf-8"
			});
			return opts
		};
		Store.prototype._urlFor = function(action, id) {
			var url;
			url = this.options.prefix != null ? this.options.prefix: "";
			url += this.options.urls[action];
			url = url.replace(/\/:id/, id != null ? "/" + id: "");
			url = url.replace(/:id/, id != null ? id: "");
			return url
		};
		Store.prototype._methodFor = function(action) {
			var table;
			table = {
				create: "POST",
				read: "GET",
				update: "PUT",
				destroy: "DELETE",
				search: "GET"
			};
			return table[action]
		};
		Store.prototype._dataFor = function(annotation) {
			var data,
			highlights;
			highlights = annotation.highlights;
			delete annotation.highlights;
			$.extend(annotation, this.options.annotationData);
			data = JSON.stringify(annotation);
			if (highlights) {
				annotation.highlights = highlights
			}
			return data
		};
		Store.prototype._onError = function(xhr) {
			var action,
			message;
			action = xhr._action;
			message = Annotator._t("Sorry we could not ") + action + Annotator._t(" this annotation");
			if (xhr._action === "search") {
				message = Annotator._t("Sorry we could not search the store for annotations")
			} else if (xhr._action === "read" && !xhr._id) {
				message = Annotator._t("Sorry we could not ") + action + Annotator._t(" the annotations from the store")
			}
			switch (xhr.status) {
			case 401:
				message = Annotator._t("Sorry you are not allowed to ") + action + Annotator._t(" this annotation");
				break;
			case 404:
				message = Annotator._t("Sorry we could not connect to the annotations store");
				break;
			case 500:
				message = Annotator._t("Sorry something went wrong with the annotation store")
			}
			Annotator.showNotification(message, Annotator.Notification.ERROR);
			return console.error(Annotator._t("API request failed:") + (" '" + xhr.status + "'"))
		};
		return Store
	} (Annotator.Plugin);
	Annotator.Plugin.Permissions = function(_super) {
		__extends(Permissions, _super);
		Permissions.prototype.events = {
			beforeAnnotationCreated: "addFieldsToAnnotation"
		};
		Permissions.prototype.options = {
			showViewPermissionsCheckbox: true,
			showEditPermissionsCheckbox: true,
			userId: function(user) {
				return user
			},
			userString: function(user) {
				return user
			},
			userAuthorize: function(action, annotation, user) {
				var token,
				tokens,
				_k,
				_len2;
				if (annotation.permissions) {
					tokens = annotation.permissions[action] || [];
					if (tokens.length === 0) {
						return true
					}
					for (_k = 0, _len2 = tokens.length; _k < _len2; _k++) {
						token = tokens[_k];
						if (this.userId(user) === token) {
							return true
						}
					}
					return false
				} else if (annotation.user) {
					if (user) {
						return this.userId(user) === this.userId(annotation.user)
					} else {
						return false
					}
				}
				return true
			},
			user: "",
			permissions: {
				read: [],
				update: [],
				"delete": [],
				admin: []
			}
		};
		function Permissions(element, options) {
			this._setAuthFromToken = __bind(this._setAuthFromToken, this);
			this.updateViewer = __bind(this.updateViewer, this);
			this.updateAnnotationPermissions = __bind(this.updateAnnotationPermissions, this);
			this.updatePermissionsField = __bind(this.updatePermissionsField, this);
			this.addFieldsToAnnotation = __bind(this.addFieldsToAnnotation, this);
			Permissions.__super__.constructor.apply(this, arguments);
			if (this.options.user) {
				this.setUser(this.options.user);
				delete this.options.user
			}
		}
		Permissions.prototype.pluginInit = function() {
			var createCallback,
			self;
			if (!Annotator.supported()) {
				return
			}
			self = this;
			createCallback = function(method, type) {
				return function(field, annotation) {
					return self[method].call(self, type, field, annotation)
				}
			};
			if (!this.user && this.annotator.plugins.Auth) {
				this.annotator.plugins.Auth.withToken(this._setAuthFromToken)
			}
			if (this.options.showViewPermissionsCheckbox === true) {
				this.annotator.editor.addField({
					type: "checkbox",
					label: Annotator._t("Allow anyone to <strong>view</strong> this annotation"),
					load: createCallback("updatePermissionsField", "read"),
					submit: createCallback("updateAnnotationPermissions", "read")
				})
			}
			if (this.options.showEditPermissionsCheckbox === true) {
				this.annotator.editor.addField({
					type: "checkbox",
					label: Annotator._t("Allow anyone to <strong>edit</strong> this annotation"),
					load: createCallback("updatePermissionsField", "update"),
					submit: createCallback("updateAnnotationPermissions", "update")
				})
			}
			this.annotator.viewer.addField({
				load: this.updateViewer
			});
			if (this.annotator.plugins.Filter) {
				return this.annotator.plugins.Filter.addFilter({
					label: Annotator._t("User"),
					property: "user",
					isFiltered: function(_this) {
						return function(input, user) {
							var keyword,
							_k,
							_len2,
							_ref2;
							user = _this.options.userString(user);
							if (! (input && user)) {
								return false
							}
							_ref2 = input.split(/\s*/);
							for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
								keyword = _ref2[_k];
								if (user.indexOf(keyword) === -1) {
									return false
								}
							}
							return true
						}
					} (this)
				})
			}
		};
		Permissions.prototype.setUser = function(user) {
			return this.user = user
		};
		Permissions.prototype.addFieldsToAnnotation = function(annotation) {
			if (annotation) {
				annotation.permissions = this.options.permissions;
				if (this.user) {
					return annotation.user = this.user
				}
			}
		};
		Permissions.prototype.authorize = function(action, annotation, user) {
			if (user === void 0) {
				user = this.user
			}
			if (this.options.userAuthorize) {
				return this.options.userAuthorize.call(this.options, action, annotation, user)
			} else {
				return true
			}
		};
		Permissions.prototype.updatePermissionsField = function(action, field, annotation) {
			var input;
			field = $(field).show();
			input = field.find("input").removeAttr("disabled");
			if (!this.authorize("admin", annotation)) {
				field.hide()
			}
			if (this.authorize(action, annotation || {},
			null)) {
				return input.attr("checked", "checked")
			} else {
				return input.removeAttr("checked")
			}
		};
		Permissions.prototype.updateAnnotationPermissions = function(type, field, annotation) {
			var dataKey;
			if (!annotation.permissions) {
				annotation.permissions = this.options.permissions
			}
			dataKey = type + "-permissions";
			if ($(field).find("input").is(":checked")) {
				return annotation.permissions[type] = []
			} else {
				return annotation.permissions[type] = [this.options.userId(this.user)]
			}
		};
		Permissions.prototype.updateViewer = function(field, annotation, controls) {
			var user,
			username;
			field = $(field);
			username = this.options.userString(annotation.user);
			if (annotation.user && username && typeof username === "string") {
				user = Annotator.Util.escape(this.options.userString(annotation.user));
				field.html(user).addClass("annotator-user")
			} else {
				field.remove()
			}
			if (controls) {
				if (!this.authorize("update", annotation)) {
					controls.hideEdit()
				}
				if (!this.authorize("delete", annotation)) {
					return controls.hideDelete()
				}
			}
		};
		Permissions.prototype._setAuthFromToken = function(token) {
			return this.setUser(token.userId)
		};
		return Permissions
	} (Annotator.Plugin);
	Annotator.Plugin.AnnotateItPermissions = function(_super) {
		__extends(AnnotateItPermissions, _super);
		function AnnotateItPermissions() {
			this._setAuthFromToken = __bind(this._setAuthFromToken, this);
			this.updateAnnotationPermissions = __bind(this.updateAnnotationPermissions, this);
			this.updatePermissionsField = __bind(this.updatePermissionsField, this);
			this.addFieldsToAnnotation = __bind(this.addFieldsToAnnotation, this);
			return AnnotateItPermissions.__super__.constructor.apply(this, arguments)
		}
		AnnotateItPermissions.prototype.options = {
			showViewPermissionsCheckbox: true,
			showEditPermissionsCheckbox: true,
			groups: {
				world: "group:__world__",
				authenticated: "group:__authenticated__",
				consumer: "group:__consumer__"
			},
			userId: function(user) {
				return user.userId
			},
			userString: function(user) {
				return user.userId
			},
			userAuthorize: function(action, annotation, user) {
				var action_field,
				permissions,
				_ref2,
				_ref3,
				_ref4,
				_ref5;
				permissions = annotation.permissions || {};
				action_field = permissions[action] || [];
				if (_ref2 = this.groups.world, __indexOf.call(action_field, _ref2) >= 0) {
					return true
				} else if (user != null && user.userId != null && user.consumerKey != null) {
					if (user.userId === annotation.user && user.consumerKey === annotation.consumer) {
						return true
					} else if (_ref3 = this.groups.authenticated, __indexOf.call(action_field, _ref3) >= 0) {
						return true
					} else if (user.consumerKey === annotation.consumer && (_ref4 = this.groups.consumer, __indexOf.call(action_field, _ref4) >= 0)) {
						return true
					} else if (user.consumerKey === annotation.consumer && (_ref5 = user.userId, __indexOf.call(action_field, _ref5) >= 0)) {
						return true
					} else if (user.consumerKey === annotation.consumer && user.admin) {
						return true
					} else {
						return false
					}
				} else {
					return false
				}
			},
			permissions: {
				read: ["group:__world__"],
				update: [],
				"delete": [],
				admin: []
			}
		};
		AnnotateItPermissions.prototype.addFieldsToAnnotation = function(annotation) {
			if (annotation) {
				annotation.permissions = this.options.permissions;
				if (this.user) {
					annotation.user = this.user.userId;
					return annotation.consumer = this.user.consumerKey
				}
			}
		};
		AnnotateItPermissions.prototype.updatePermissionsField = function(action, field, annotation) {
			var input;
			field = $(field).show();
			input = field.find("input").removeAttr("disabled");
			if (!this.authorize("admin", annotation)) {
				field.hide()
			}
			if (this.user && this.authorize(action, annotation || {},
			{
				userId: "__nonexistentuser__",
				consumerKey: this.user.consumerKey
			})) {
				return input.attr("checked", "checked")
			} else {
				return input.removeAttr("checked")
			}
		};
		AnnotateItPermissions.prototype.updateAnnotationPermissions = function(type, field, annotation) {
			var dataKey;
			if (!annotation.permissions) {
				annotation.permissions = this.options.permissions
			}
			dataKey = type + "-permissions";
			if ($(field).find("input").is(":checked")) {
				return annotation.permissions[type] = [type === "read" ? this.options.groups.world: this.options.groups.consumer]
			} else {
				return annotation.permissions[type] = []
			}
		};
		AnnotateItPermissions.prototype._setAuthFromToken = function(token) {
			return this.setUser(token)
		};
		return AnnotateItPermissions
	} (Annotator.Plugin.Permissions);
	Annotator.Plugin.Filter = function(_super) {
		__extends(Filter, _super);
		Filter.prototype.events = {
			".annotator-filter-property input focus": "_onFilterFocus",
			".annotator-filter-property input blur": "_onFilterBlur",
			".annotator-filter-property input keyup": "_onFilterKeyup",
			".annotator-filter-previous click": "_onPreviousClick",
			".annotator-filter-next click": "_onNextClick",
			".annotator-filter-clear click": "_onClearClick"
		};
		Filter.prototype.classes = {
			active: "annotator-filter-active",
			hl: {
				hide: "annotator-hl-filtered",
				active: "annotator-hl-active"
			}
		};
		Filter.prototype.html = { //Amanda: removed navigation code, changed title text
			element: '<div class="annotator-filter">\n <strong>' + "</strong>\n</div>",
			filter: '<span class="annotator-filter-property">\n  <label></label>\n  <input/>\n  <button class="annotator-filter-clear">' + Annotator._t("Clear") + "</button>\n</span>"
		};
		Filter.prototype.options = {
			appendTo: "#theannotationfilter",
			filters: [],
			addAnnotationFilter: true,
			isFiltered: function(input, property) {
				var keyword,
				_k,
				_len2,
				_ref2;
				if (! (input && property)) {
					return false
				}
				_ref2 = input.split(/\s+/);
				for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
					keyword = _ref2[_k];
					if (property.indexOf(keyword) === -1) {
						return false
					}
				}
				return true
			}
		};
		function Filter(element, options) {
			this._onPreviousClick = __bind(this._onPreviousClick, this);
			this._onNextClick = __bind(this._onNextClick, this);
			this._onFilterKeyup = __bind(this._onFilterKeyup, this);
			this._onFilterBlur = __bind(this._onFilterBlur, this);
			this._onFilterFocus = __bind(this._onFilterFocus, this);
			this.updateHighlights = __bind(this.updateHighlights, this);
			var _base;
			element = $(this.html.element).appendTo((options != null ? options.appendTo: void 0) || this.options.appendTo);
			Filter.__super__.constructor.call(this, element, options); (_base = this.options).filters || (_base.filters = []);
			this.filter = $(this.html.filter);
			this.filters = [];
			this.current = 0
		}
		Filter.prototype.pluginInit = function() {
			var filter,
			_k,
			_len2,
			_ref2;
			_ref2 = this.options.filters;
			for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
				filter = _ref2[_k];
				this.addFilter(filter)
			}
			this.updateHighlights();
			this._setupListeners()._insertSpacer();
			if (this.options.addAnnotationFilter === true) {
				return this.addFilter({
					label: Annotator._t("Annotation"),
					property: "text"
				})
			}
		};
		Filter.prototype.destroy = function() {
			var currentMargin,
			html;
			Filter.__super__.destroy.apply(this, arguments);
			html = $("html");
			currentMargin = parseInt(html.css("padding-top"), 10) || 0;
			html.css("padding-top", currentMargin - this.element.outerHeight());
			return this.element.remove()
		};
		Filter.prototype._insertSpacer = function() {
			var currentMargin,
			html;
			html = $("html");
			currentMargin = parseInt(html.css("padding-top"), 10) || 0;
			html.css("padding-top", currentMargin + this.element.outerHeight());
			return this
		};
		Filter.prototype._setupListeners = function() {
			var event,
			events,
			_k,
			_len2;
			events = ["annotationsLoaded", "annotationCreated", "annotationUpdated", "annotationDeleted"];
			for (_k = 0, _len2 = events.length; _k < _len2; _k++) {
				event = events[_k];
				this.annotator.subscribe(event, this.updateHighlights)
			}
			return this
		};
		Filter.prototype.addFilter = function(options) {
			var f,
			filter;
			filter = $.extend({
				label: "",
				property: "",
				isFiltered: this.options.isFiltered
			},
			options);
			if (!
			function() {
				var _k,
				_len2,
				_ref2,
				_results;
				_ref2 = this.filters;
				_results = [];
				for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
					f = _ref2[_k];
					if (f.property === filter.property) {
						_results.push(f)
					}
				}
				return _results
			}.call(this).length) {
				filter.id = "annotator-filter-" + filter.property;
				filter.annotations = [];
				filter.element = this.filter.clone().appendTo(this.element);
				filter.element.find("label").html(filter.label).attr("for", filter.id);
				filter.element.find("input").attr({
					id: filter.id,
					placeholder: Annotator._t("Filter by ") + filter.label + "…"
				});
				filter.element.find("button").hide();
				filter.element.data("filter", filter);
				this.filters.push(filter)
			}
			return this
		};
		Filter.prototype.updateFilter = function(filter) {
			var annotation,
			annotations,
			input,
			property,
			_k,
			_len2,
			_ref2;
			filter.annotations = [];
			this.updateHighlights();
			this.resetHighlights();
			input = $.trim(filter.element.find("input").val());
			if (input) {
				annotations = this.highlights.map(function() {
					return $(this).data("annotation")
				});
				_ref2 = $.makeArray(annotations);
				for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
					annotation = _ref2[_k];
					property = annotation[filter.property];
					if (filter.isFiltered(input, property)) {
						filter.annotations.push(annotation)
					}
				}
				return this.filterHighlights()
			}
		};
		Filter.prototype.updateHighlights = function() {
			this.highlights = this.annotator.element.find(".annotator-hl:visible");
			return this.filtered = this.highlights.not(this.classes.hl.hide)
		};
		Filter.prototype.filterHighlights = function() {
			var activeFilters,
			annotation,
			annotations,
			filtered,
			highlights,
			index,
			uniques,
			_k,
			_len2,
			_ref2;
			activeFilters = $.grep(this.filters, 
			function(filter) {
				return !! filter.annotations.length
			});
			filtered = ((_ref2 = activeFilters[0]) != null ? _ref2.annotations: void 0) || [];
			if (activeFilters.length > 1) {
				annotations = [];
				$.each(activeFilters, 
				function() {
					return $.merge(annotations, this.annotations)
				});
				uniques = [];
				filtered = [];
				$.each(annotations, 
				function() {
					if ($.inArray(this, uniques) === -1) {
						return uniques.push(this)
					} else {
						return filtered.push(this)
					}
				})
			}
			highlights = this.highlights;
			for (index = _k = 0, _len2 = filtered.length; _k < _len2; index = ++_k) {
				annotation = filtered[index];
				highlights = highlights.not(annotation.highlights)
			}
			highlights.addClass(this.classes.hl.hide);
			this.filtered = this.highlights.not(this.classes.hl.hide);
			return this
		};
		Filter.prototype.resetHighlights = function() {
			this.highlights.removeClass(this.classes.hl.hide);
			this.filtered = this.highlights;
			return this
		};
		Filter.prototype._onFilterFocus = function(event) {
			var input;
			input = $(event.target);
			input.parent().addClass(this.classes.active);
			return input.next("button").show()
		};
		Filter.prototype._onFilterBlur = function(event) {
			var input;
			if (!event.target.value) {
				input = $(event.target);
				input.parent().removeClass(this.classes.active);
				return input.next("button").hide()
			}
		};
		Filter.prototype._onFilterKeyup = function(event) {
			var filter;
			filter = $(event.target).parent().data("filter");
			if (filter) {
				return this.updateFilter(filter)
			}
		};
		Filter.prototype._findNextHighlight = function(previous) {
			var active,
			annotation,
			current,
			index,
			next,
			offset,
			operator,
			resetOffset;
			if (!this.highlights.length) {
				return this
			}
			offset = previous ? 0: -1;
			resetOffset = previous ? -1: 0;
			operator = previous ? "lt": "gt";
			active = this.highlights.not("." + this.classes.hl.hide);
			current = active.filter("." + this.classes.hl.active);
			if (!current.length) {
				current = active.eq(offset)
			}
			annotation = current.data("annotation");
			index = active.index(current[0]);
			next = active.filter(":" + operator + "(" + index + ")").not(annotation.highlights).eq(resetOffset);
			if (!next.length) {
				next = active.eq(resetOffset)
			}
			return this._scrollToHighlight(next.data("annotation").highlights)
		};
		Filter.prototype._onNextClick = function(event) {
			return this._findNextHighlight()
		};
		Filter.prototype._onPreviousClick = function(event) {
			return this._findNextHighlight(true)
		};
		Filter.prototype._scrollToHighlight = function(highlight) {
			highlight = $(highlight);
			this.highlights.removeClass(this.classes.hl.active);
			highlight.addClass(this.classes.hl.active);
			return $("html, body").animate({
				scrollTop: highlight.offset().top - (this.element.height() + 20)
			},
			150)
		};
		Filter.prototype._onClearClick = function(event) {
			return $(event.target).prev("input").val("").keyup().blur()
		};
		return Filter
	} (Annotator.Plugin);
	
	Annotator.Plugin.Tags = function(_super) {
		__extends(Tags, _super);
		function Tags() {
			this.setAnnotationTags = __bind(this.setAnnotationTags, this);
			this.updateField = __bind(this.updateField, this);
			return Tags.__super__.constructor.apply(this, arguments)
		}
		Tags.prototype.options = {
			parseTags: function(string) {
				var tags;
				string = $.trim(string);
				tags = [];
				if (string) {
					tags = string.split(/\s+/)
				}
				return tags
			},
			stringifyTags: function(array) {
				return array.join(" ")
			}
		};
		Tags.prototype.field = null;
		Tags.prototype.input = null;
		Tags.prototype.pluginInit = function() {
			if (!Annotator.supported()) {
				return
			}
			this.field = this.annotator.editor.addField({
				label: Annotator._t("Add some tags here") + "…",
				load: this.updateField,
				submit: this.setAnnotationTags
			});
			this.annotator.viewer.addField({
				load: this.updateViewer
			});
			if (this.annotator.plugins.Filter) {
				this.annotator.plugins.Filter.addFilter({
					label: Annotator._t("Tag"),
					property: "tags",
					isFiltered: Annotator.Plugin.Tags.filterCallback
				})
			}
			return this.input = $(this.field).find(":input")
		};
		Tags.prototype.parseTags = function(string) {
			return this.options.parseTags(string)
		};
		Tags.prototype.stringifyTags = function(array) {
			return this.options.stringifyTags(array)
		};
		Tags.prototype.updateField = function(field, annotation) {
			var value;
			value = "";
			if (annotation.tags) {
				value = this.stringifyTags(annotation.tags)
			}
			return this.input.val(value)
		};
		Tags.prototype.setAnnotationTags = function(field, annotation) {
			return annotation.tags = this.parseTags(this.input.val())
		};
		Tags.prototype.updateViewer = function(field, annotation) {
			field = $(field);
			if (annotation.tags && $.isArray(annotation.tags) && annotation.tags.length) {
				return field.addClass("annotator-tags").html(function() {
					var string;
					return string = $.map(annotation.tags, 
					function(tag) {
						return '<span class="annotator-tag">' + Annotator.Util.escape(tag) + "</span>"
					}).join(" ")
				})
			} else {
				return field.remove()
			}
		};
		return Tags
	} (Annotator.Plugin);
	Annotator.Plugin.Tags.filterCallback = function(input, tags) {
		var keyword,
		keywords,
		matches,
		tag,
		_k,
		_l,
		_len2,
		_len3;
		if (tags == null) {
			tags = []
		}
		matches = 0;
		keywords = [];
		if (input) {
			keywords = input.split(/\s+/g);
			for (_k = 0, _len2 = keywords.length; _k < _len2; _k++) {
				keyword = keywords[_k];
				if (tags.length) {
					for (_l = 0, _len3 = tags.length; _l < _len3; _l++) {
						tag = tags[_l];
						if (tag.indexOf(keyword) !== -1) {
							matches += 1
						}
					}
				}
			}
		}
		return matches === keywords.length
	};
	Annotator.prototype.setupPlugins = function(config, options) {
		var name,
		opts,
		pluginConfig,
		plugins,
		uri,
		win,
		_k,
		_len2,
		_results;
		if (config == null) {
			config = {}
		}
		if (options == null) {
			options = {}
		}
		win = Annotator.Util.getGlobal();
		plugins = ["Unsupported", "Auth", "Tags", "Filter", "Store", "AnnotateItPermissions"];
		uri = win.location.href.split(/#|\?/).shift() || "";
		pluginConfig = {
			Tags: {},
			Filter: {
				filters: [{
					label: Annotator._t("User"),
					property: "user"
				},
				{
					label: Annotator._t("Tags"),
					property: "tags"
				}]
			},
			Auth: {
				tokenUrl: config.tokenUrl || "http://annotateit.org/api/token"
			},
			Store: {
				prefix: config.storeUrl || "http://annotateit.org/api",
				annotationData: {
					uri: uri
				},
				loadFromSearch: {
					uri: uri
				}
			}
		};
		for (name in options) {
			if (!__hasProp.call(options, name)) continue;
			opts = options[name];
			if (__indexOf.call(plugins, name) < 0) {
				plugins.push(name)
			}
		}
		$.extend(true, pluginConfig, options);
		_results = [];
		for (_k = 0, _len2 = plugins.length; _k < _len2; _k++) {
			name = plugins[_k];
			if (! (name in pluginConfig) || pluginConfig[name]) {
				_results.push(this.addPlugin(name, pluginConfig[name]))
			} else {
				_results.push(void 0)
			}
		}
		return _results
	}
}.call(this);
//
//# sourceMappingURL=annotator-full.min.map;
(function ($) {
  Drupal.behaviors.annotator = {
    attach: function (context, settings) {
      Drupal.Annotator = $(Drupal.settings.annotator.element).annotator();
    }
  };


})(jQuery);

;
(function ($) {
  Drupal.behaviors.annotatorStore = {
    attach: function (context, settings) {
      Drupal.Annotator.annotator('addPlugin', 'Store', {
        prefix: settings.annotator_store.prefix,
        urls: settings.annotator_store.urls,
        annotationData: {
          'uri': window.location.href,
          'type': 'annotator'
        },
        loadFromSearch: {
          'limit': 0, // Amanda: does this fix the issue of loading all available annotations?
          'uri': window.location.href
        }
      });
    }
  };
})(jQuery);
;
(function ($) {
  Drupal.behaviors.annotatorUnsupported = {
    attach: function (context, settings) {
      Drupal.Annotator.annotator('addPlugin', 'Unsupported');
    }
  };
})(jQuery);;
(function ($) {
  Drupal.behaviors.annotatorFilter = {
    attach: function (context, settings) {
      Drupal.Annotator.annotator('addPlugin', 'Filter');
    }
  };
})(jQuery);;
(function ($) {
  Drupal.behaviors.annotatorPermissions = {
    attach: function (context, settings) {
      Drupal.Annotator.annotator('addPlugin', 'Permissions', {
        user: settings.annotator_permissions.user,
        permissions: settings.annotator_permissions.permissions,
        showViewPermissionsCheckbox: settings.annotator_permissions.showViewPermissionsCheckbox == 1,
        showEditPermissionsCheckbox: settings.annotator_permissions.showEditPermissionsCheckbox == 1,
        userId: function (user) {
          if (user && user.uid) {
            return user.uid;
          }
          return user;
        },
        userString: function (user) {
          if (user && user.name) {
            return user.name;
          }
          return user;
        },
        /*
        userAuthorize: function (action, annotation, user) {
          if (user && annotation) {

            // Edit own annotations
            if (annotation.permissions[action]['user'] &&
               (user.uid == annotation.user.uid) &&
               (jQuery.inArray(user.uid, annotation.permissions[action]['user']) !== -1)) {
              return true;
            }

            // Check if user has appropriate role
            for (var i = 0; i < user.roles.length; i++) {
              var role = jQuery.inArray(user.roles[i], annotation.permissions[action]['roles']);
              if (jQuery.inArray(user.roles[i], annotation.permissions[action]['roles']) !== -1) {
                return true;
              }
            }
          }

          // Deny access
          return false;
        }*/
      });
    }
  };
})(jQuery);
;
(function ($) {
  Drupal.behaviors.annotatorTags = {
    attach: function (context, settings) {
      Drupal.Annotator.annotator('addPlugin', 'Tags');
    }
  };
})(jQuery);;
/* Amanda: patched via this workaround: https://www.drupal.org/node/1543752#comment-7393666 */
(function ($) {
  Drupal.behaviors.ViewsExposedFormFix = {
    attach: function() {
      if (Drupal.settings && Drupal.settings.views && Drupal.settings.views.ajaxViews) {
        $.each(Drupal.settings.views.ajaxViews, function(i, settings) {
          // This matches the logic in Drupal.views.ajaxView.prototype.attachExposedFormAjax.
          var exposed_form = $('form#views-exposed-form-'+ settings.view_name.replace(/_/g, '-') + '-' + settings.view_display_id.replace(/_/g, '-'));
          exposed_form.once('views-exposed-form-fix', function() {
            var button = $('input[type=submit], button[type=submit], input[type=image]', exposed_form);
            button = button[0];
            // This will catch browsers that don't activate the submit button when pressing enter in the form.
            exposed_form.submit(function (event) {
              button.click();
              event.preventDefault();
              return false;
            });
          })
        });
      }
    }
  };
})(jQuery);;
(function($){
/**
 * To make a form auto submit, all you have to do is 3 things:
 *
 * ctools_add_js('auto-submit');
 *
 * On gadgets you want to auto-submit when changed, add the ctools-auto-submit
 * class. With FAPI, add:
 * @code
 *  '#attributes' => array('class' => array('ctools-auto-submit')),
 * @endcode
 *
 * If you want to have auto-submit for every form element,
 * add the ctools-auto-submit-full-form to the form. With FAPI, add:
 * @code
 *   '#attributes' => array('class' => array('ctools-auto-submit-full-form')),
 * @endcode
 *
 * If you want to exclude a field from the ctool-auto-submit-full-form auto submission,
 * add the class ctools-auto-submit-exclude to the form element. With FAPI, add:
 * @code
 *   '#attributes' => array('class' => array('ctools-auto-submit-exclude')),
 * @endcode
 *
 * Finally, you have to identify which button you want clicked for autosubmit.
 * The behavior of this button will be honored if it's ajaxy or not:
 * @code
 *  '#attributes' => array('class' => array('ctools-use-ajax', 'ctools-auto-submit-click')),
 * @endcode
 *
 * Currently only 'select', 'radio', 'checkbox' and 'textfield' types are supported. We probably
 * could use additional support for HTML5 input types.
 */

Drupal.behaviors.CToolsAutoSubmit = {
  attach: function(context) {
    // 'this' references the form element
    function triggerSubmit (e) {
      var $this = $(this);
      if (!$this.hasClass('ctools-ajaxing')) {
        $this.find('.ctools-auto-submit-click').click();
      }
    }

    // the change event bubbles so we only need to bind it to the outer form
    $('form.ctools-auto-submit-full-form', context)
      .add('.ctools-auto-submit', context)
      .filter('form, select, input:not(:text, :submit)')
      .once('ctools-auto-submit')
      .change(function (e) {
        // don't trigger on text change for full-form
        if ($(e.target).is(':not(:text, :submit, .ctools-auto-submit-exclude)')) {
          triggerSubmit.call(e.target.form);
        }
      });

    // e.keyCode: key
    var discardKeyCode = [
      16, // shift
      17, // ctrl
      18, // alt
      20, // caps lock
      33, // page up
      34, // page down
      35, // end
      36, // home
      37, // left arrow
      38, // up arrow
      39, // right arrow
      40, // down arrow
       9, // tab
      13, // enter
      27  // esc
    ];
    // Don't wait for change event on textfields
    $('.ctools-auto-submit-full-form input:text, input:text.ctools-auto-submit', context)
      .filter(':not(.ctools-auto-submit-exclude)')
      .once('ctools-auto-submit', function () {
        // each textinput element has his own timeout
        var timeoutID = 0;
        $(this)
          .bind('keydown keyup', function (e) {
            if ($.inArray(e.keyCode, discardKeyCode) === -1) {
              timeoutID && clearTimeout(timeoutID);
            }
          })
          .keyup(function(e) {
            if ($.inArray(e.keyCode, discardKeyCode) === -1) {
              timeoutID = setTimeout($.proxy(triggerSubmit, this.form), 500);
            }
          })
          .bind('change', function (e) {
            if ($.inArray(e.keyCode, discardKeyCode) === -1) {
              timeoutID = setTimeout($.proxy(triggerSubmit, this.form), 500);
            }
          });
      });
  }
}
})(jQuery);
;
(function($) {

Drupal.behaviors.viewsExPost = {
  attach: function(context, settings) {
    for (var formID in settings.viewsExPost.exPostForms) {
      var theView = $(settings.viewsExPost.exPostForms[formID], context);

      $('.pager a', theView).click(function(event) {
        event.preventDefault();

        var newPageNum = 1;
        // Get the page number from the URL of the link
        newPageNum = decodeURIComponent(this.href.substring(this.href.indexOf('&page=') + 6));
        $('#' + formID).attr('action', $('#' + formID).attr('action') + '?page=' + newPageNum);

        //$('.expost-pager', theView).val(newPageNum);
        jQuery('.form-submit', $('#' + formID)).click();
      });
    }
  }
};

})(jQuery);

/**
 *  TODO:
 *  1- Multiple views (with ExPost) on same page
 *  2- pager id (with multiple pagers)
 */;
/*!
 * jQuery Expander Plugin - v1.4.13 - 2014-10-05
 * http://plugins.learningjquery.com/expander/
 * Copyright (c) 2014 Karl Swedberg
 * Licensed MIT (http://www.opensource.org/licenses/mit-license.php)
 */

(function($) {
  $.expander = {
    version: '1.4.13',
    defaults: {
      // the number of characters at which the contents will be sliced into two parts.
      slicePoint: 100,

      // a string of characters at which to slice the contents into two parts,
      // but only if the string appears before slicePoint
      // Useful for slicing at the first line break, e.g. {sliceOn: '<br'}
      sliceOn: null,

      // whether to keep the last word of the summary whole (true) or let it slice in the middle of a word (false)
      preserveWords: true,

      // whether to count and display the number of words inside the collapsed text
      showWordCount: false,

      // What to display around the counted number of words, set to '{{count}}' to show only the number
      wordCountText: ' ({{count}} words)',

      // a threshold of sorts for whether to initially hide/collapse part of the element's contents.
      // If after slicing the contents in two there are fewer words in the second part than
      // the value set by widow, we won't bother hiding/collapsing anything.
      widow: 4,

      // text displayed in a link instead of the hidden part of the element.
      // clicking this will expand/show the hidden/collapsed text
      expandText: 'read more',
      expandPrefix: '&hellip; ',

      expandAfterSummary: false,

      // Possible word endings to test against for when preserveWords: true
      wordEnd: /(&(?:[^;]+;)?|[a-zA-Z\u00C0-\u0100]+|[^\u0000-\u007F]+)$/,

      // class names for summary element and detail element
      summaryClass: 'summary',
      detailClass: 'details',

      // class names for <span> around "read-more" link and "read-less" link
      moreClass: 'read-more',
      lessClass: 'read-less',

      // class names for <a> around "read-more" link and "read-less" link
      moreLinkClass: 'more-link',
      lessLinkClass: 'less-link',

      // number of milliseconds after text has been expanded at which to collapse the text again.
      // when 0, no auto-collapsing
      collapseTimer: 0,

      // effects for expanding and collapsing
      expandEffect: 'slideDown',
      expandSpeed: 250,
      collapseEffect: 'slideUp',
      collapseSpeed: 200,

      // allow the user to re-collapse the expanded text.
      userCollapse: true,

      // text to use for the link to re-collapse the text
      userCollapseText: 'read less',
      userCollapsePrefix: ' ',


      // all callback functions have the this keyword mapped to the element in the jQuery set when .expander() is called

      onSlice: null, // function() {}
      beforeExpand: null, // function() {},
      afterExpand: null, // function() {},
      onCollapse: null, // function(byUser) {}
      afterCollapse: null // function() {}
    }
  };

  $.fn.expander = function(options) {
    var meth = 'init';

    if (typeof options === 'string') {
      meth = options;
      options = {};
    }

    var opts = $.extend({}, $.expander.defaults, options),
        rSelfClose = /^<(?:area|br|col|embed|hr|img|input|link|meta|param).*>$/i,
        rAmpWordEnd = opts.wordEnd,
        rOpenCloseTag = /<\/?(\w+)[^>]*>/g,
        rOpenTag = /<(\w+)[^>]*>/g,
        rCloseTag = /<\/(\w+)>/g,
        rLastCloseTag = /(<\/([^>]+)>)\s*$/,
        rTagPlus = /^(<[^>]+>)+.?/,
        rMultiSpace = /\s\s+/g,
        delayedCollapse;

    var removeSpaces = function(str) {
      return $.trim( str || '' ).replace(rMultiSpace, ' ');
    };

    var methods = {
      init: function() {
        this.each(function() {
          var i, l, tmp, newChar, summTagless, summOpens, summCloses,
              lastCloseTag, detailText, detailTagless, html, expand,
              $thisDetails, $readMore,
              slicePointChanged,
              openTagsForDetails = [],
              closeTagsForsummaryText = [],
              strayChars = '',
              defined = {},
              thisEl = this,
              $this = $(this),
              $summEl = $([]),
              o = $.extend({}, opts, $this.data('expander') || $.meta && $this.data() || {}),
              hasDetails = !!$this.find('.' + o.detailClass).length,
              hasBlocks = !!$this.find('*').filter(function() {
                var display = $(this).css('display');
                return (/^block|table|list/).test(display);
              }).length,
              el = hasBlocks ? 'div' : 'span',
              detailSelector = el + '.' + o.detailClass,
              moreClass = o.moreClass + '',
              lessClass = o.lessClass + '',
              expandSpeed = o.expandSpeed || 0,
              allHtml = removeSpaces( $this.html() ),
              summaryText = allHtml.slice(0, o.slicePoint);

          // allow multiple classes for more/less links
          o.moreSelector = 'span.' + moreClass.split(' ').join('.');
          o.lessSelector = 'span.' + lessClass.split(' ').join('.');
          // bail out if we've already set up the expander on this element
          if ( $.data(this, 'expanderInit') ) {
            return;
          }

          $.data(this, 'expanderInit', true);
          $.data(this, 'expander', o);
          // determine which callback functions are defined
          $.each(['onSlice','beforeExpand', 'afterExpand', 'onCollapse', 'afterCollapse'], function(index, val) {
            defined[val] = $.isFunction(o[val]);
          });

          // back up if we're in the middle of a tag or word
          summaryText = backup(summaryText);

          // summary text sans tags length
          summTagless = summaryText.replace(rOpenCloseTag, '').length;

          // add more characters to the summary, one for each character in the tags
          while (summTagless < o.slicePoint) {
            newChar = allHtml.charAt(summaryText.length);
            if (newChar === '<') {
              newChar = allHtml.slice(summaryText.length).match(rTagPlus)[0];
            }
            summaryText += newChar;
            summTagless++;
          }

          // SliceOn script, Closes #16, resolves #59
          // Original SliceEarlierAt code (since modfied): Sascha Peilicke @saschpe
          if (o.sliceOn) {
            slicePointChanged = changeSlicePoint({
              sliceOn: o.sliceOn,
              slicePoint: o.slicePoint,
              allHtml: allHtml,
              summaryText: summaryText
            });

            summaryText = slicePointChanged.summaryText;
          }

          summaryText = backup(summaryText, o.preserveWords && allHtml.slice(summaryText.length).length);

          // separate open tags from close tags and clean up the lists
          summOpens = summaryText.match(rOpenTag) || [];
          summCloses = summaryText.match(rCloseTag) || [];

          // filter out self-closing tags
          tmp = [];
          $.each(summOpens, function(index, val) {
            if ( !rSelfClose.test(val) ) {
              tmp.push(val);
            }
          });
          summOpens = tmp;

          // strip close tags to just the tag name
          l = summCloses.length;
          for (i = 0; i < l; i++) {
            summCloses[i] = summCloses[i].replace(rCloseTag, '$1');
          }

          // tags that start in summary and end in detail need:
          // a). close tag at end of summary
          // b). open tag at beginning of detail
          $.each(summOpens, function(index, val) {
            var thisTagName = val.replace(rOpenTag, '$1');
            var closePosition = $.inArray(thisTagName, summCloses);

            if (closePosition === -1) {
              openTagsForDetails.push(val);
              closeTagsForsummaryText.push('</' + thisTagName + '>');

            } else {
              summCloses.splice(closePosition, 1);
            }
          });

          // reverse the order of the close tags for the summary so they line up right
          closeTagsForsummaryText.reverse();

          // create necessary summary and detail elements if they don't already exist
          if ( !hasDetails ) {

            // end script if there is no detail text or if detail has fewer words than widow option
            detailText = allHtml.slice(summaryText.length);
            detailTagless = $.trim( detailText.replace(rOpenCloseTag, '') );

            if ( detailTagless === '' || detailTagless.split(/\s+/).length < o.widow ) {
              return;
            }
            // otherwise, continue...
            lastCloseTag = closeTagsForsummaryText.pop() || '';
            summaryText += closeTagsForsummaryText.join('');
            detailText = openTagsForDetails.join('') + detailText;

          } else {
            // assume that even if there are details, we still need readMore/readLess/summary elements
            // (we already bailed out earlier when readMore el was found)
            // but we need to create els differently

            // remove the detail from the rest of the content
            detailText = $this.find(detailSelector).remove().html();

            // The summary is what's left
            summaryText = $this.html();

            // allHtml is the summary and detail combined (this is needed when content has block-level elements)
            allHtml = summaryText + detailText;

            lastCloseTag = '';
          }
          o.moreLabel = $this.find(o.moreSelector).length ? '' : buildMoreLabel(o, detailText);

          if (hasBlocks) {
            detailText = allHtml;
            //Fixes issue #89; Tested by 'split html escapes'
          } else if (summaryText.charAt(summaryText.length-1) === '&') {
            strayChars = /^[#\w\d\\]+;/.exec(detailText);
            if (strayChars) {
              detailText = detailText.slice(strayChars[0].length);
              summaryText += strayChars[0];
            }
          }
          summaryText += lastCloseTag;

          // onSlice callback
          o.summary = summaryText;
          o.details = detailText;
          o.lastCloseTag = lastCloseTag;

          if (defined.onSlice) {
            // user can choose to return a modified options object
            // one last chance for user to change the options. sneaky, huh?
            // but could be tricky so use at your own risk.
            tmp = o.onSlice.call(thisEl, o);

          // so, if the returned value from the onSlice function is an object with a details property, we'll use that!
            o = tmp && tmp.details ? tmp : o;
          }

          // build the html with summary and detail and use it to replace old contents
          html = buildHTML(o, hasBlocks);

          $this.html( html );

          // set up details and summary for expanding/collapsing
          $thisDetails = $this.find(detailSelector);
          $readMore = $this.find(o.moreSelector);

          // Hide details span using collapseEffect unless
          // expandEffect is NOT slideDown and collapseEffect IS slideUp.
          // The slideUp effect sets span's "default" display to
          // inline-block. This is necessary for slideDown, but
          // problematic for other "showing" animations.
          // Fixes #46
          if (o.collapseEffect === 'slideUp' && o.expandEffect !== 'slideDown' || $this.is(':hidden')) {
            $thisDetails.css({display: 'none'});
          } else {
            $thisDetails[o.collapseEffect](0);
          }

          $summEl = $this.find('div.' + o.summaryClass);

          expand = function(event) {
            event.preventDefault();
            $readMore.hide();
            $summEl.hide();
            if (defined.beforeExpand) {
              o.beforeExpand.call(thisEl);
            }

            $thisDetails.stop(false, true)[o.expandEffect](expandSpeed, function() {
              $thisDetails.css({zoom: ''});
              if (defined.afterExpand) {o.afterExpand.call(thisEl);}
              delayCollapse(o, $thisDetails, thisEl);
            });
          };

          $readMore.find('a').unbind('click.expander').bind('click.expander', expand);

          if ( o.userCollapse && !$this.find(o.lessSelector).length ) {
            $this
            .find(detailSelector)
            .append('<span class="' + o.lessClass + '">' + o.userCollapsePrefix + '<a href="#" class="'+ o.lessLinkClass +'">' + o.userCollapseText + '</a></span>');
          }

          $this
          .find(o.lessSelector + ' a')
          .unbind('click.expander')
          .bind('click.expander', function(event) {
            event.preventDefault();
            clearTimeout(delayedCollapse);
            var $detailsCollapsed = $(this).closest(detailSelector);
            reCollapse(o, $detailsCollapsed);
            if (defined.onCollapse) {
              o.onCollapse.call(thisEl, true);
            }
          });

        }); // this.each
      },
      destroy: function() {

        this.each(function() {
          var o, details,
              $this = $(this);

          if ( !$this.data('expanderInit') ) {
            return;
          }

          o = $.extend({}, $this.data('expander') || {}, opts);
          details = $this.find('.' + o.detailClass).contents();

          $this.removeData('expanderInit');
          $this.removeData('expander');

          $this.find(o.moreSelector).remove();
          $this.find('.' + o.summaryClass).remove();
          $this.find('.' + o.detailClass).after(details).remove();
          $this.find(o.lessSelector).remove();

        });
      }
    };

    // run the methods (almost always "init")
    if ( methods[meth] ) {
      methods[ meth ].call(this);
    }

    // utility functions
    function buildHTML(o, blocks) {
      var el = 'span',
          summary = o.summary,
          closingTagParts = rLastCloseTag.exec(summary),
          closingTag = closingTagParts ? closingTagParts[2].toLowerCase() : '';
      if ( blocks ) {
        el = 'div';

        // if summary ends with a close tag, tuck the moreLabel inside it
        if ( closingTagParts && closingTag !== 'a' && !o.expandAfterSummary ) {
          summary = summary.replace(rLastCloseTag, o.moreLabel + '$1');
        } else {
        // otherwise (e.g. if ends with self-closing tag) just add moreLabel after summary
        // fixes #19
          summary += o.moreLabel;
        }

        // and wrap it in a div
        summary = '<div class="' + o.summaryClass + '">' + summary + '</div>';
      } else {
        summary += o.moreLabel;
      }

      return [
        summary,
        ' <',
        el + ' class="' + o.detailClass + '"',
        '>',
        o.details,
        '</' + el + '>'
      ].join('');
    }

    function buildMoreLabel(o, detailText) {
      var ret = '<span class="' + o.moreClass + '">' + o.expandPrefix;

      if (o.showWordCount) {

        o.wordCountText = o.wordCountText.replace(/\{\{count\}\}/, detailText.replace(rOpenCloseTag, '').replace(/\&(?:amp|nbsp);/g, '').replace(/(?:^\s+|\s+$)/, '').match(/\w+/g).length);

      } else {
        o.wordCountText = '';
      }
      ret += '<a href="#" class="' + o.moreLinkClass + '">' + o.expandText + o.wordCountText + '</a></span>';
      return ret;
    }

    function backup(txt, preserveWords) {
      if ( txt.lastIndexOf('<') > txt.lastIndexOf('>') ) {
        txt = txt.slice( 0, txt.lastIndexOf('<') );
      }
      if (preserveWords) {
        txt = txt.replace(rAmpWordEnd,'');
      }

      return $.trim(txt);
    }

    function reCollapse(o, el) {
      el.stop(true, true)[o.collapseEffect](o.collapseSpeed, function() {
        var prevMore = el.prev('span.' + o.moreClass).show();
        if (!prevMore.length) {
          el.parent().children('div.' + o.summaryClass).show()
            .find('span.' + o.moreClass).show();
        }
        if (o.afterCollapse) {o.afterCollapse.call(el);}
      });
    }

    function delayCollapse(option, $collapseEl, thisEl) {
      if (option.collapseTimer) {
        delayedCollapse = setTimeout(function() {
          reCollapse(option, $collapseEl);
          if ( $.isFunction(option.onCollapse) ) {
            option.onCollapse.call(thisEl, false);
          }
        }, option.collapseTimer);
      }
    }

    function changeSlicePoint(info) {
      // Create placeholder string text
      var sliceOnTemp = 'ExpandMoreHere374216623';

      // Replace sliceOn with placeholder unaffected by .text() cleaning
      // (in case sliceOn contains html)
      var summaryTextClean = info.summaryText.replace(info.sliceOn, sliceOnTemp);
      summaryTextClean = $('<div>' + summaryTextClean + '</div>').text();

      // Find true location of sliceOn placeholder
      var sliceOnIndexClean = summaryTextClean.indexOf(sliceOnTemp);

      // Store location of html version too
      var sliceOnIndexHtml = info.summaryText.indexOf(info.sliceOn);

      // Base condition off of true sliceOn location...
      if (sliceOnIndexClean !== -1 && sliceOnIndexClean < info.slicePoint) {
        // ...but keep html in summaryText
        info.summaryText = info.allHtml.slice(0, sliceOnIndexHtml);
      }
      return info;
    }

    return this;
  };

  // plugin defaults
  $.fn.expander.defaults = $.expander.defaults;
})(jQuery);
;
/**
 * @file
 * Some basic behaviors and utility functions for Views.
 */
(function ($) {

Drupal.Views = {};

/**
 * jQuery UI tabs, Views integration component
 */
Drupal.behaviors.viewsTabs = {
  attach: function (context) {
    if ($.viewsUi && $.viewsUi.tabs) {
      $('#views-tabset').once('views-processed').viewsTabs({
        selectedClass: 'active'
      });
    }

    $('a.views-remove-link').once('views-processed').click(function(event) {
      var id = $(this).attr('id').replace('views-remove-link-', '');
      $('#views-row-' + id).hide();
      $('#views-removed-' + id).attr('checked', true);
      event.preventDefault();
   });
  /**
    * Here is to handle display deletion
    * (checking in the hidden checkbox and hiding out the row)
    */
  $('a.display-remove-link')
    .addClass('display-processed')
    .click(function() {
      var id = $(this).attr('id').replace('display-remove-link-', '');
      $('#display-row-' + id).hide();
      $('#display-removed-' + id).attr('checked', true);
      return false;
  });
  }
};

/**
 * Helper function to parse a querystring.
 */
Drupal.Views.parseQueryString = function (query) {
  var args = {};
  var pos = query.indexOf('?');
  if (pos != -1) {
    query = query.substring(pos + 1);
  }
  var pairs = query.split('&');
  for(var i in pairs) {
    if (typeof(pairs[i]) == 'string') {
      var pair = pairs[i].split('=');
      // Ignore the 'q' path argument, if present.
      if (pair[0] != 'q' && pair[1]) {
        args[decodeURIComponent(pair[0].replace(/\+/g, ' '))] = decodeURIComponent(pair[1].replace(/\+/g, ' '));
      }
    }
  }
  return args;
};

/**
 * Helper function to return a view's arguments based on a path.
 */
Drupal.Views.parseViewArgs = function (href, viewPath) {
  var returnObj = {};
  var path = Drupal.Views.getPath(href);
  // Ensure we have a correct path.
  if (viewPath && path.substring(0, viewPath.length + 1) == viewPath + '/') {
    var args = decodeURIComponent(path.substring(viewPath.length + 1, path.length));
    returnObj.view_args = args;
    returnObj.view_path = path;
  }
  return returnObj;
};

/**
 * Strip off the protocol plus domain from an href.
 */
Drupal.Views.pathPortion = function (href) {
  // Remove e.g. http://example.com if present.
  var protocol = window.location.protocol;
  if (href.substring(0, protocol.length) == protocol) {
    // 2 is the length of the '//' that normally follows the protocol
    href = href.substring(href.indexOf('/', protocol.length + 2));
  }
  return href;
};

/**
 * Return the Drupal path portion of an href.
 */
Drupal.Views.getPath = function (href) {
  href = Drupal.Views.pathPortion(href);
  href = href.substring(Drupal.settings.basePath.length, href.length);
  // 3 is the length of the '?q=' added to the url without clean urls.
  if (href.substring(0, 3) == '?q=') {
    href = href.substring(3, href.length);
  }
  var chars = ['#', '?', '&'];
  for (i in chars) {
    if (href.indexOf(chars[i]) > -1) {
      href = href.substr(0, href.indexOf(chars[i]));
    }
  }
  return href;
};

})(jQuery);
;
(function ($) {

/**
 * jQuery expander.
 */
Drupal.behaviors.jqueryExpander = {
  attach: function (context) {
  
    var expander = Drupal.settings.jqueryExpander;
      // Add the jQuery expander.
      for (var key in expander) {
        $('.field-expander-' + key).expander(expander[key]);
      }
    }
};

})(jQuery);;
(function ($) {
  Drupal.communityTags = {};

  Drupal.communityTags.checkPlain = function (text) {
    text = Drupal.checkPlain(text);
    return text.replace(/^\s+/g, '')
               .replace(/\s+$/g, '')
               .replace('\n', '<br />');
  }

  Drupal.communityTags.serialize = function (data, prefix) {
    prefix = prefix || '';
    var out = '';
    for (i in data) {
      var name = prefix.length ? (prefix +'[' + i +']') : i;
      if (out.length) out += '&';
      if (typeof data[i] == 'object') {
        out += Drupal.communityTags.serialize(data[i], name);
      }
      else {
        out += name +'=';
        out += encodeURIComponent(data[i]);
      }
    }
    return out;
  }

  Drupal.behaviors.communityTags = {
    attach: function(context) {
      // Note: all tag fields are autocompleted, and have already been initialized at this point.
      $('input.form-tags', context).once('form-tags', function () {
        // Hide submit buttons.
        $('input[type=submit]', this.form).hide();

        // Fetch settings.
        var nid = $('input[name=nid]', this.form).val();
        var o = Drupal.settings.communityTags['n_' + nid];
        var vid = $('input[name=vid]', this.form).val();
        var o = Drupal.settings.communityTags['n_' + nid]['v_' + vid];

        var sequence = 0;

        // Show the textfield and empty its value.
        var textfield = $(this).val('').css('display', 'inline');

        // Prepare the add Ajax handler and add the button.
        var addHandler = function () {
          // Send existing tags and new tag string.
          $.post(o.url, Drupal.communityTags.serialize({ sequence: ++sequence, tags: o.tags, add: textfield[0].value, token: o.token }), function (data) {
            // data = $.parseJson(data);
            if (data.status && sequence == data.sequence) {
              o.tags = data.tags;
              updateList();
            }
          });

          // Add tag to local list
          o.tags.push(textfield[0].value);
          o.tags.sort(function (a,b) { a = a.toLowerCase(); b = b.toLowerCase(); return (a>b) ? 1 : (a<b) ? -1 : 0; });
          updateList();

          // Clear field and focus it.
          textfield.val('').focus();
        };
        var button = $('<input type="button" class="form-button" value="'+ Drupal.communityTags.checkPlain(o.add) +'" />').click(addHandler);
        $(this.form).submit(function () { addHandler(); return false; });

        // Prepare the delete Ajax handler.
        var deleteHandler = function () {
          // Remove tag from local list.
          var i = $(this).attr('key');
          o.tags.splice(i, 1);
          updateList();

          // Send new tag list.
          $.post(o.url, Drupal.communityTags.serialize({ sequence: ++sequence, tags: o.tags, add: '', token: o.token }), function (data) {
            // data = $.parseJson(data);

            if (data.status && sequence == data.sequence) {
              o.tags = data.tags;
              updateList();
            }
          });

          // Clear textfield and focus it.
          textfield.val('').focus();
        };

        // Callback to update the tag list.
        function updateList() {
          list.empty();
          for (i in o.tags) {
            list.append('<li key="'+ Drupal.communityTags.checkPlain(i) +'">'+ Drupal.communityTags.checkPlain(o.tags[i]) +'</li>');
          }
          $("li", list).hover(
            function () {
              $(this).addClass('hover');
            },
            function () {
              $(this).removeClass('hover');
            }
          );
          $('li', list).click(deleteHandler);
        }

        // Create widget markup.
        // @todo theme this.
        var widget = $('<div class="tag-widget"><ul class="inline-tags clearfix"></ul></div>');
        textfield.before(widget);
        widget.append(textfield).append(button);
        var list = $('ul', widget);

        updateList();
      });
    }
  }
})(jQuery);;
(function ($) {
  Drupal.behaviors.rate = {
    attach: function(context) {
      $('.rate-widget:not(.rate-processed)', context).addClass('rate-processed').each(function () {
        var widget = $(this);
        // as we use drupal_html_id() to generate unique ids
        // we have to truncate the '--<id>'
        var ids = widget.attr('id').split('--');
        ids = ids[0].match(/^rate\-([a-z]+)\-([0-9]+)\-([0-9]+)\-([0-9])$/);
        var data = {
          content_type: ids[1],
          content_id: ids[2],
          widget_id: ids[3],
          widget_mode: ids[4]
        };

        $('a.rate-button', widget).click(function() {
          var token = this.getAttribute('href').match(/rate\=([a-zA-Z0-9\-_]{32,64})/)[1];
          return Drupal.rateVote(widget, data, token);
        });
      });
    }
  };

  Drupal.rateVote = function(widget, data, token) {
    // Invoke JavaScript hook.
    widget.trigger('eventBeforeRate', [data]);

    $(".rate-info", widget).text(Drupal.t('Saving vote...'));

    // Random number to prevent caching, see http://drupal.org/node/1042216#comment-4046618
    var random = Math.floor(Math.random() * 99999);

    var q = (Drupal.settings.rate.basePath.match(/\?/) ? '&' : '?') + 'widget_id=' + data.widget_id + '&content_type=' + data.content_type + '&content_id=' + data.content_id + '&widget_mode=' + data.widget_mode + '&token=' + token + '&destination=' + encodeURIComponent(Drupal.settings.rate.destination) + '&r=' + random;
    if (data.value) {
      q = q + '&value=' + data.value;
    }

    // fetch all widgets with this id as class
    widget = $('.' + widget.attr('id'));

    $.get(Drupal.settings.rate.basePath + q, function(response) {
      if (response.match(/^https?\:\/\/[^\/]+\/(.*)$/)) {
        // We got a redirect.
        document.location = response;
      }
      else {
        // get parent object
        var p = widget.parent();

        // Invoke JavaScript hook.
        widget.trigger('eventAfterRate', [data]);

        widget.before(response);

        // remove widget
        widget.remove();
        widget = undefined;

        Drupal.attachBehaviors(p);
      }
    });

    return false;
  }
})(jQuery);
;
/**
 * @file
 * Handles AJAX fetching of views, including filter submission and response.
 */
(function ($) {

/**
 * Attaches the AJAX behavior to Views exposed filter forms and key View links.
 */
Drupal.behaviors.ViewsAjaxView = {};
Drupal.behaviors.ViewsAjaxView.attach = function() {
  if (Drupal.settings && Drupal.settings.views && Drupal.settings.views.ajaxViews) {
    $.each(Drupal.settings.views.ajaxViews, function(i, settings) {
      Drupal.views.instances[i] = new Drupal.views.ajaxView(settings);
    });
  }
};

Drupal.views = {};
Drupal.views.instances = {};

/**
 * Javascript object for a certain view.
 */
Drupal.views.ajaxView = function(settings) {
  var selector = '.view-dom-id-' + settings.view_dom_id;
  this.$view = $(selector);

  // Retrieve the path to use for views' ajax.
  var ajax_path = Drupal.settings.views.ajax_path;

  // If there are multiple views this might've ended up showing up multiple times.
  if (ajax_path.constructor.toString().indexOf("Array") != -1) {
    ajax_path = ajax_path[0];
  }

  // Check if there are any GET parameters to send to views.
  var queryString = window.location.search || '';
  if (queryString !== '') {
    // Remove the question mark and Drupal path component if any.
    var queryString = queryString.slice(1).replace(/q=[^&]+&?|&?render=[^&]+/, '');
    if (queryString !== '') {
      // If there is a '?' in ajax_path, clean url are on and & should be used to add parameters.
      queryString = ((/\?/.test(ajax_path)) ? '&' : '?') + queryString;
    }
  }

  this.element_settings = {
    url: ajax_path + queryString,
    submit: settings,
    setClick: true,
    event: 'click',
    selector: selector,
    progress: { type: 'throbber' }
  };

  this.settings = settings;

  // Add the ajax to exposed forms.
  this.$exposed_form = this.$view.children('.view-filters').children('form');
  this.$exposed_form.once(jQuery.proxy(this.attachExposedFormAjax, this));

  // Add the ajax to pagers.
  this.$view
    // Don't attach to nested views. Doing so would attach multiple behaviors
    // to a given element.
    .filter(jQuery.proxy(this.filterNestedViews, this))
    .once(jQuery.proxy(this.attachPagerAjax, this));

  // Add a trigger to update this view specifically. In order to trigger a
  // refresh use the following code.
  //
  // @code
  // jQuery('.view-name').trigger('RefreshView');
  // @endcode
  // Add a trigger to update this view specifically.
  var self_settings = this.element_settings;
  self_settings.event = 'RefreshView';
  this.refreshViewAjax = new Drupal.ajax(this.selector, this.$view, self_settings);
};

Drupal.views.ajaxView.prototype.attachExposedFormAjax = function() {
  var button = $('input[type=submit], button[type=submit], input[type=image]', this.$exposed_form);
  button = button[0];

  this.exposedFormAjax = new Drupal.ajax($(button).attr('id'), button, this.element_settings);
};

Drupal.views.ajaxView.prototype.filterNestedViews= function() {
  // If there is at least one parent with a view class, this view
  // is nested (e.g., an attachment). Bail.
  return !this.$view.parents('.view').size();
};

/**
 * Attach the ajax behavior to each link.
 */
Drupal.views.ajaxView.prototype.attachPagerAjax = function() {
  this.$view.find('ul.pager > li > a, th.views-field a, .attachment .views-summary a')
  .each(jQuery.proxy(this.attachPagerLinkAjax, this));
};

/**
 * Attach the ajax behavior to a singe link.
 */
Drupal.views.ajaxView.prototype.attachPagerLinkAjax = function(id, link) {
  var $link = $(link);
  var viewData = {};
  var href = $link.attr('href');
  // Construct an object using the settings defaults and then overriding
  // with data specific to the link.
  $.extend(
    viewData,
    this.settings,
    Drupal.Views.parseQueryString(href),
    // Extract argument data from the URL.
    Drupal.Views.parseViewArgs(href, this.settings.view_base_path)
  );

  // For anchor tags, these will go to the target of the anchor rather
  // than the usual location.
  $.extend(viewData, Drupal.Views.parseViewArgs(href, this.settings.view_base_path));

  this.element_settings.submit = viewData;
  this.pagerAjax = new Drupal.ajax(false, $link, this.element_settings);
};

Drupal.ajax.prototype.commands.viewsScrollTop = function (ajax, response, status) {
  // Scroll to the top of the view. This will allow users
  // to browse newly loaded content after e.g. clicking a pager
  // link.
  var offset = $(response.selector).offset();
  // We can't guarantee that the scrollable object should be
  // the body, as the view could be embedded in something
  // more complex such as a modal popup. Recurse up the DOM
  // and scroll the first element that has a non-zero top.
  var scrollTarget = response.selector;
  while ($(scrollTarget).scrollTop() == 0 && $(scrollTarget).parent()) {
    scrollTarget = $(scrollTarget).parent();
  }
  // Only scroll upward
  if (offset.top - 10 < $(scrollTarget).scrollTop()) {
    $(scrollTarget).animate({scrollTop: (offset.top - 10)}, 500);
  }
};

})(jQuery);
;
/**
 * @file
 * Integrate Sidr library with Responsive Menus.
 */
(function ($) {
  /**
   * Preparation for each element Sidr will affect.
   */
  function sidr_it(menuElement, ind, iteration, $windowWidth) {
    // Only apply if window size is correct.
    var $media_size = iteration.media_size || 768;
    // Call Sidr with our settings.
    $(menuElement).once('responsive-menus-sidr', function() {
      var $id = 'sidr-' + ind;
      var $wrapper_id = 'sidr-wrapper-' + ind;
      $(this).before('<div id="' + $wrapper_id + '"><a id="' + $id + '-button" href="#' + $id + '">' + iteration.trigger_txt + '</a></div>');
      $('#' + $wrapper_id).hide();
      if ($windowWidth <= $media_size) {
        $('#' + $wrapper_id).show();
        $(this).hide();
      }
      // Set 1/0 to true/false respectively.
      $.each(iteration, function(key, value) {
        if (value == 0) {
          iteration[key] = false;
        }
        if (value == 1) {
          iteration[key] = true;
        }
      });
      // Sidr power go.
      $('#' + $id + '-button').sidr({
        name: $id || "sidr",
        speed: iteration.speed || 200,
        side: iteration.side || "left",
        source: iteration.selectors[ind] || "#main-menu",
        displace: iteration.displace,
        onOpen: function() { eval(iteration.onOpen); } || function() {},
        onClose: function() { eval(iteration.onClose); } || function() {}
      });
    });
  }


  /**
   * Main loop.
   */
  Drupal.behaviors.responsive_menus_sidr = {
    attach: function (context, settings) {
      settings.responsive_menus = settings.responsive_menus || {};
      var $windowWidth = document.documentElement.clientWidth || document.body.clientWidth;
      $.each(settings.responsive_menus, function(ind, iteration) {
        if (iteration.responsive_menus_style != 'sidr') {
          return true;
        }
        if (!iteration.selectors.length) {
          return;
        }
        // Iterate each selector.
        $.each(iteration.selectors, function(index, value) {
          // Stop if there is no menu element.
          if ($(value).length < 1) {
            return true;
          }
          // Multi-level (selector hits multiple ul's).
          if ($(value).length > 1) {
              $(value).each(function(val_index) {
                if (!$(this).parents('ul').length) {
                  sidr_it(this, index, iteration, $windowWidth);
                }
              });
            }
            else {
              // Single level.
              sidr_it(value, index, iteration, $windowWidth);
            }
        });
      });

      // Handle window resizing.
      $(window).resize(function() {
        // Window width with legacy browsers.
        $windowWidth = document.documentElement.clientWidth || document.body.clientWidth;
        $.each(settings.responsive_menus, function(ind, iteration) {
          if (iteration.responsive_menus_style != 'sidr') {
            return true;
          }
          if (!iteration.selectors.length) {
            return;
          }
          // Iterate each selector.
          $.each(iteration.selectors, function(index, value) {
            // Stop if there is no menu element.
            if ($(value).length < 1) {
              return true;
            }
            var $wrapper_id = 'sidr-wrapper-' + index;
            $media_size = iteration.media_size || 768;
            if ($windowWidth <= $media_size) {
              if (!$(value).hasClass('sidr-hidden')) {
                $('#' + $wrapper_id).show();
                $(value).hide().addClass('sidr-hidden');
              }
            }
            else {
              if ($(value).hasClass('sidr-hidden')) {
                $('#' + $wrapper_id).hide();
                $(value).show().removeClass('sidr-hidden');
              }
            }
          });
        });
      });
    }
  };
}(jQuery));
;
/*! Sidr - v1.2.1 - 2013-11-06
 * https://github.com/artberri/sidr
 * Copyright (c) 2013 Alberto Varela; Licensed MIT */
(function(e){var t=!1,i=!1,n={isUrl:function(e){var t=RegExp("^(https?:\\/\\/)?((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*(\\?[;&a-z\\d%_.~+=-]*)?(\\#[-a-z\\d_]*)?$","i");return t.test(e)?!0:!1},loadContent:function(e,t){e.html(t)},addPrefix:function(e){var t=e.attr("id"),i=e.attr("class");"string"==typeof t&&""!==t&&e.attr("id",t.replace(/([A-Za-z0-9_.\-]+)/g,"sidr-id-$1")),"string"==typeof i&&""!==i&&"sidr-inner"!==i&&e.attr("class",i.replace(/([A-Za-z0-9_.\-]+)/g,"sidr-class-$1")),e.removeAttr("style")},execute:function(n,s,a){"function"==typeof s?(a=s,s="sidr"):s||(s="sidr");var r,d,l,c=e("#"+s),u=e(c.data("body")),f=e("html"),p=c.outerWidth(!0),g=c.data("speed"),h=c.data("side"),m=c.data("displace"),v=c.data("onOpen"),y=c.data("onClose"),x="sidr"===s?"sidr-open":"sidr-open "+s+"-open";if("open"===n||"toggle"===n&&!c.is(":visible")){if(c.is(":visible")||t)return;if(i!==!1)return o.close(i,function(){o.open(s)}),void 0;t=!0,"left"===h?(r={left:p+"px"},d={left:"0px"}):(r={right:p+"px"},d={right:"0px"}),u.is("body")&&(l=f.scrollTop(),f.css("overflow-x","hidden").scrollTop(l)),m?u.addClass("sidr-animating").css({width:u.width(),position:"absolute"}).animate(r,g,function(){e(this).addClass(x)}):setTimeout(function(){e(this).addClass(x)},g),c.css("display","block").animate(d,g,function(){t=!1,i=s,"function"==typeof a&&a(s),u.removeClass("sidr-animating")}),v()}else{if(!c.is(":visible")||t)return;t=!0,"left"===h?(r={left:0},d={left:"-"+p+"px"}):(r={right:0},d={right:"-"+p+"px"}),u.is("body")&&(l=f.scrollTop(),f.removeAttr("style").scrollTop(l)),u.addClass("sidr-animating").animate(r,g).removeClass(x),c.animate(d,g,function(){c.removeAttr("style").hide(),u.removeAttr("style"),e("html").removeAttr("style"),t=!1,i=!1,"function"==typeof a&&a(s),u.removeClass("sidr-animating")}),y()}}},o={open:function(e,t){n.execute("open",e,t)},close:function(e,t){n.execute("close",e,t)},toggle:function(e,t){n.execute("toggle",e,t)},toogle:function(e,t){n.execute("toggle",e,t)}};e.sidr=function(t){return o[t]?o[t].apply(this,Array.prototype.slice.call(arguments,1)):"function"!=typeof t&&"string"!=typeof t&&t?(e.error("Method "+t+" does not exist on jQuery.sidr"),void 0):o.toggle.apply(this,arguments)},e.fn.sidr=function(t){var i=e.extend({name:"sidr",speed:200,side:"left",source:null,renaming:!0,body:"body",displace:!0,onOpen:function(){},onClose:function(){}},t),s=i.name,a=e("#"+s);if(0===a.length&&(a=e("<div />").attr("id",s).appendTo(e("body"))),a.addClass("sidr").addClass(i.side).data({speed:i.speed,side:i.side,body:i.body,displace:i.displace,onOpen:i.onOpen,onClose:i.onClose}),"function"==typeof i.source){var r=i.source(s);n.loadContent(a,r)}else if("string"==typeof i.source&&n.isUrl(i.source))e.get(i.source,function(e){n.loadContent(a,e)});else if("string"==typeof i.source){var d="",l=i.source.split(",");if(e.each(l,function(t,i){d+='<div class="sidr-inner">'+e(i).html()+"</div>"}),i.renaming){var c=e("<div />").html(d);c.find("*").each(function(t,i){var o=e(i);n.addPrefix(o)}),d=c.html()}n.loadContent(a,d)}else null!==i.source&&e.error("Invalid Sidr Source");return this.each(function(){var t=e(this),i=t.data("sidr");i||(t.data("sidr",s),"ontouchstart"in document.documentElement?(t.bind("touchstart",function(e){e.originalEvent.touches[0],this.touched=e.timeStamp}),t.bind("touchend",function(e){var t=Math.abs(e.timeStamp-this.touched);200>t&&(e.preventDefault(),o.toggle(s))})):t.click(function(e){e.preventDefault(),o.toggle(s)}))})}})(jQuery);;
/**
 * @file
 * Integrate GoogleNexus (codrops) library with Responsive Menus module.
 */

(function ($) {
  Drupal.behaviors.responsive_menus_google_nexus = {
    attach: function (context, settings) {
      settings.responsive_menus = settings.responsive_menus || {};
      $.each(settings.responsive_menus, function(ind, iteration) {
        if (iteration.responsive_menus_style != 'google_nexus') {
          return true;
        }
        if (!iteration.selectors.length) {
          return;
        }
        // Main loop.
        $(iteration.selectors).once('responsive-menus-google-nexus', function() {
          $(this).attr('class', 'gn-menu responsive-menus-google-nexus-processed').removeAttr('id');
          if (iteration.use_ecoicons == '1') {
            $(this).addClass('ecoicons');
          }
          // Add icons in front of menu items.
          $(this).find('a').each(function(a_ind) {
            if (iteration.icons[a_ind]) {
              // Un-escape unicode or html entities.
              var $icon = $('<div />').html(JSON.parse('"' + iteration.icons[a_ind] + '"')).text();
              $(this).attr('data-content', $icon);
            }
            else {
              $icon = $('<div />').html(JSON.parse('"' + iteration.icon_fallback + '"')).text();
              $(this).attr('data-content', $icon);
            }
          });
          // Add other required classes.
          $(this).find('ul').attr('class', 'gn-submenu');
          $(this).find('li').removeAttr('class');

          $(this).before('<div class="gn-menu-container"></div>');
          // Wrap with the structure Google Nexus Menu needs.
          $('.gn-menu-container').append('<ul id="gn-menu" class="gn-menu-main" style="z-index: 99;">'
           + '<li class="gn-trigger">'
           + '<a class="gn-icon gn-icon-menu"><span>Menu</span></a>'
           + '<nav class="gn-menu-wrapper">'
           + '<div class="gn-scroller">'
           + $(this)[0].outerHTML
           + '</div>'
           + '</nav>'
           + '</li>'
           + '<li></li>'
           + '</ul>');

          $(this).remove();
          // Create the menu.
          new gnMenu(document.getElementById('gn-menu'));

        });
      });
    }
  };
}(jQuery));
;
/**
 * gnmenu.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
;( function( window ) {
	
	'use strict';

	// http://stackoverflow.com/a/11381730/989439
	function mobilecheck() {
		var check = false;
		(function(a){if(/(android|ipad|playbook|silk|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
		return check;
	}

	function gnMenu( el, options ) {	
		this.el = el;
		this._init();
	}

	gnMenu.prototype = {
		_init : function() {
			this.trigger = this.el.querySelector( 'a.gn-icon-menu' );
			this.menu = this.el.querySelector( 'nav.gn-menu-wrapper' );
			this.isMenuOpen = false;
			this.eventtype = mobilecheck() ? 'touchstart' : 'click';
			this._initEvents();

			var self = this;
			this.bodyClickFn = function() {
				self._closeMenu();
				this.removeEventListener( self.eventtype, self.bodyClickFn );
			};
		},
		_initEvents : function() {
			var self = this;

			if( !mobilecheck() ) {
				this.trigger.addEventListener( 'mouseover', function(ev) { self._openIconMenu(); } );
				this.trigger.addEventListener( 'mouseout', function(ev) { self._closeIconMenu(); } );
			
				this.menu.addEventListener( 'mouseover', function(ev) {
					self._openMenu(); 
					document.addEventListener( self.eventtype, self.bodyClickFn ); 
				} );
			}
			this.trigger.addEventListener( this.eventtype, function( ev ) {
				ev.stopPropagation();
				ev.preventDefault();
				if( self.isMenuOpen ) {
					self._closeMenu();
					document.removeEventListener( self.eventtype, self.bodyClickFn );
				}
				else {
					self._openMenu();
					document.addEventListener( self.eventtype, self.bodyClickFn );
				}
			} );
			this.menu.addEventListener( this.eventtype, function(ev) { ev.stopPropagation(); } );
		},
		_openIconMenu : function() {
			classie.add( this.menu, 'gn-open-part' );
		},
		_closeIconMenu : function() {
			classie.remove( this.menu, 'gn-open-part' );
		},
		_openMenu : function() {
			if( this.isMenuOpen ) return;
			classie.add( this.trigger, 'gn-selected' );
			this.isMenuOpen = true;
			classie.add( this.menu, 'gn-open-all' );
			this._closeIconMenu();
		},
		_closeMenu : function() {
			if( !this.isMenuOpen ) return;
			classie.remove( this.trigger, 'gn-selected' );
			this.isMenuOpen = false;
			classie.remove( this.menu, 'gn-open-all' );
			this._closeIconMenu();
		}
	}

	// add to global namespace
	window.gnMenu = gnMenu;

} )( window );;
/*!
 * classie - class helper functions
 * from bonzo https://github.com/ded/bonzo
 * 
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

/*jshint browser: true, strict: true, undef: true */
/*global define: false */

( function( window ) {

'use strict';

// class helper functions from bonzo https://github.com/ded/bonzo

function classReg( className ) {
  return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
}

// classList support for class management
// altho to be fair, the api sucks because it won't accept multiple classes at once
var hasClass, addClass, removeClass;

if ( 'classList' in document.documentElement ) {
  hasClass = function( elem, c ) {
    return elem.classList.contains( c );
  };
  addClass = function( elem, c ) {
    elem.classList.add( c );
  };
  removeClass = function( elem, c ) {
    elem.classList.remove( c );
  };
}
else {
  hasClass = function( elem, c ) {
    return classReg( c ).test( elem.className );
  };
  addClass = function( elem, c ) {
    if ( !hasClass( elem, c ) ) {
      elem.className = elem.className + ' ' + c;
    }
  };
  removeClass = function( elem, c ) {
    elem.className = elem.className.replace( classReg( c ), ' ' );
  };
}

function toggleClass( elem, c ) {
  var fn = hasClass( elem, c ) ? removeClass : addClass;
  fn( elem, c );
}

var classie = {
  // full names
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  toggleClass: toggleClass,
  // short names
  has: hasClass,
  add: addClass,
  remove: removeClass,
  toggle: toggleClass
};

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( classie );
} else {
  // browser global
  window.classie = classie;
}

})( window );
;
(function ($) {

Drupal.googleanalytics = {};

$(document).ready(function() {

  // Attach mousedown, keyup, touchstart events to document only and catch
  // clicks on all elements.
  $(document.body).bind("mousedown keyup touchstart", function(event) {

    // Catch the closest surrounding link of a clicked element.
    $(event.target).closest("a,area").each(function() {

      // Is the clicked URL internal?
      if (Drupal.googleanalytics.isInternal(this.href)) {
        // Skip 'click' tracking, if custom tracking events are bound.
        if ($(this).is('.colorbox')) {
          // Do nothing here. The custom event will handle all tracking.
          //console.info("Click on .colorbox item has been detected.");
        }
        // Is download tracking activated and the file extension configured for download tracking?
        else if (Drupal.settings.googleanalytics.trackDownload && Drupal.googleanalytics.isDownload(this.href)) {
          // Download link clicked.
          ga("send", "event", "Downloads", Drupal.googleanalytics.getDownloadExtension(this.href).toUpperCase(), Drupal.googleanalytics.getPageUrl(this.href));
        }
        else if (Drupal.googleanalytics.isInternalSpecial(this.href)) {
          // Keep the internal URL for Google Analytics website overlay intact.
          ga("send", "pageview", { "page": Drupal.googleanalytics.getPageUrl(this.href) });
        }
      }
      else {
        if (Drupal.settings.googleanalytics.trackMailto && $(this).is("a[href^='mailto:'],area[href^='mailto:']")) {
          // Mailto link clicked.
          ga("send", "event", "Mails", "Click", this.href.substring(7));
        }
        else if (Drupal.settings.googleanalytics.trackOutbound && this.href.match(/^\w+:\/\//i)) {
          if (Drupal.settings.googleanalytics.trackDomainMode != 2 || (Drupal.settings.googleanalytics.trackDomainMode == 2 && !Drupal.googleanalytics.isCrossDomain(this.hostname, Drupal.settings.googleanalytics.trackCrossDomains))) {
            // External link clicked / No top-level cross domain clicked.
            ga("send", "event", "Outbound links", "Click", this.href);
          }
        }
      }
    });
  });

  // Track hash changes as unique pageviews, if this option has been enabled.
  if (Drupal.settings.googleanalytics.trackUrlFragments) {
    window.onhashchange = function() {
      ga('send', 'pageview', location.pathname + location.search + location.hash);
    }
  }

  // Colorbox: This event triggers when the transition has completed and the
  // newly loaded content has been revealed.
  $(document).bind("cbox_complete", function () {
    var href = $.colorbox.element().attr("href");
    if (href) {
      ga("send", "pageview", { "page": Drupal.googleanalytics.getPageUrl(href) });
    }
  });

});

/**
 * Check whether the hostname is part of the cross domains or not.
 *
 * @param string hostname
 *   The hostname of the clicked URL.
 * @param array crossDomains
 *   All cross domain hostnames as JS array.
 *
 * @return boolean
 */
Drupal.googleanalytics.isCrossDomain = function (hostname, crossDomains) {
  /**
   * jQuery < 1.6.3 bug: $.inArray crushes IE6 and Chrome if second argument is
   * `null` or `undefined`, http://bugs.jquery.com/ticket/10076,
   * https://github.com/jquery/jquery/commit/a839af034db2bd934e4d4fa6758a3fed8de74174
   *
   * @todo: Remove/Refactor in D8
   */
  if (!crossDomains) {
    return false;
  }
  else {
    return $.inArray(hostname, crossDomains) > -1 ? true : false;
  }
};

/**
 * Check whether this is a download URL or not.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isDownload = function (url) {
  var isDownload = new RegExp("\\.(" + Drupal.settings.googleanalytics.trackDownloadExtensions + ")([\?#].*)?$", "i");
  return isDownload.test(url);
};

/**
 * Check whether this is an absolute internal URL or not.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isInternal = function (url) {
  var isInternal = new RegExp("^(https?):\/\/" + window.location.host, "i");
  return isInternal.test(url);
};

/**
 * Check whether this is a special URL or not.
 *
 * URL types:
 *  - gotwo.module /go/* links.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isInternalSpecial = function (url) {
  var isInternalSpecial = new RegExp("(\/go\/.*)$", "i");
  return isInternalSpecial.test(url);
};

/**
 * Extract the relative internal URL from an absolute internal URL.
 *
 * Examples:
 * - http://mydomain.com/node/1 -> /node/1
 * - http://example.com/foo/bar -> http://example.com/foo/bar
 *
 * @param string url
 *   The web url to check.
 *
 * @return string
 *   Internal website URL
 */
Drupal.googleanalytics.getPageUrl = function (url) {
  var extractInternalUrl = new RegExp("^(https?):\/\/" + window.location.host, "i");
  return url.replace(extractInternalUrl, '');
};

/**
 * Extract the download file extension from the URL.
 *
 * @param string url
 *   The web url to check.
 *
 * @return string
 *   The file extension of the passed url. e.g. "zip", "txt"
 */
Drupal.googleanalytics.getDownloadExtension = function (url) {
  var extractDownloadextension = new RegExp("\\.(" + Drupal.settings.googleanalytics.trackDownloadExtensions + ")([\?#].*)?$", "i");
  var extension = extractDownloadextension.exec(url);
  return (extension === null) ? '' : extension[1];
};

})(jQuery);
;
