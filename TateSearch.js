/*
 * The MIT License
 * 
 * Copyright (c) 2012 MetaBroadcast
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
 * and associated documentation files (the "Software"), to deal in the Software without restriction, 
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, 
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software 
 * is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial 
 * portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 */
var rest = require('restler');
var util = require('util');
var SearchResults = require('../modules/SearchResults');
var SearchResult = require('../modules/SearchResult');

var TateSearch = function(q, config, fn) {
	this.q = q;
	this.config = config;
	this.fn = fn; // callback function
};

TateSearch.prototype.run = function() {
	var options = {};
	var url = "http://www.tate-images.com/assetservice/getsearchresults/" + this.q;
	var o = this;
	var request;
	
	request = rest.get(url, options);
	
	var tate_timeout = setTimeout(function () {
		request.abort("timeout");
	}, this.config.timeout);
	
	request.on('complete', function(data) {
		clearTimeout(tate_timeout);
		var resultnum = 0;
		if (data.IMAGE) {
			// if more than one item returned will be array
			// otherwise it will be a single object
			// ensure always an array
			var rawResults = [];
			if (Array.isArray(data.IMAGE)) {
				rawResults = data.IMAGE;
			} else {
				rawResults.push(data.IMAGE);
			}
			for ( var i in rawResults) {
				var content = rawResults[i];
				var result = new SearchResult();
				result.addId("tate", content.IMAGEID);
				result.title = content.CAPTION;
				result.thumbnail_url = "http://www.tate-images.com" + content.DIGFILES.TNPATH;
				result.source = "tate";
				result.type = "artistic";
				o.fn(result, false);
				resultnum++;
				if (resultnum > o.config.limit) {
					break;
				}
			}
		} else {
			util.error("tate: Cannot understand response");
			util.error(data);
			util.error("=====");
		}
		o.fn("tate", true);
	});
};

module.exports = TateSearch;